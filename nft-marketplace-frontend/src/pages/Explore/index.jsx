import { useState, useEffect, useMemo, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useWeb3 } from '../../hooks/useWeb3';
import { useMarketplace } from '../../contracts/hooks/useMarketplace';
import SearchBar from '../../components/explore/SearchBar';
import { toast } from 'react-hot-toast';
import { ethers } from 'ethers';
import { CONTRACT_ADDRESSES, CollectionFactoryABI, NFTCollectionABI } from '../../utils/constants';
import axios from 'axios';
import debounce from 'lodash/debounce';
import { EthIcon } from '../../assets';

const Explore = () => {
  const navigate = useNavigate();
  const { active, account, library, chainId } = useWeb3();
  const marketplace = useMarketplace();
  const [collections, setCollections] = useState([]);
  const [loadingCollections, setLoadingCollections] = useState(false);
  const [collectionError, setCollectionError] = useState(null);
  const [searchFilters, setSearchFilters] = useState({
    term: '',
    sortBy: 'newest', // newest, oldest, name-asc, name-desc
    category: 'all' // all, art, music, photography, sports, etc.
  });

  // Debounced search function
  const debouncedSearch = useCallback(
    debounce((term) => {
      setSearchFilters(prev => ({ ...prev, term }));
    }, 300),
    []
  );

  // Smart search and filter logic
  const filteredAndSortedCollections = useMemo(() => {
    if (!collections.length) return [];

    let result = [...collections];

    // Apply search term filter
    if (searchFilters.term) {
      const searchTerms = searchFilters.term.toLowerCase().split(' ');
      result = result.filter(collection => {
        const searchableText = `${collection.name} ${collection.symbol} ${collection.description}`.toLowerCase();
        // Match all search terms (AND logic)
        return searchTerms.every(term => searchableText.includes(term));
      });
    }

    // Apply category filter
    if (searchFilters.category !== 'all') {
      result = result.filter(collection => {
        const collectionCategory = String(collection?.category || '').toLowerCase();
        return collectionCategory === searchFilters.category.toLowerCase();
      });
    }

    // Apply sorting
    switch (searchFilters.sortBy) {
      case 'newest':
        result.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        break;
      case 'oldest':
        result.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
        break;
      case 'name-asc':
        result.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case 'name-desc':
        result.sort((a, b) => b.name.localeCompare(a.name));
        break;
    }

    return result;
  }, [collections, searchFilters]);

  // Fetch all collections from blockchain
  useEffect(() => {
    const fetchCollections = async () => {
      if (!library || !chainId) {
        console.log('Web3 not initialized');
        return;
      }

      try {
        setLoadingCollections(true);
        setCollectionError(null);

        // Get contract address for current chain
        const factoryAddress = CONTRACT_ADDRESSES[chainId]?.collectionFactory;
        if (!factoryAddress) {
          throw new Error(`No contract address for chain ID ${chainId}`);
        }

        // Create contract instance
        const factoryContract = new ethers.Contract(
          factoryAddress,
          CollectionFactoryABI.abi,
          library.getSigner()
        );

        // Get all collection addresses
        const collectionAddresses = await factoryContract.getAllCollections();

        if (collectionAddresses.length === 0) {
          setCollections([]);
          return;
        }

        // Fetch collection details from blockchain and media from API
        const collectionsData = await Promise.all(
          collectionAddresses.map(async (address) => {
            try {
              // Create collection contract instance
              const collectionContract = new ethers.Contract(
                address,
                NFTCollectionABI.abi,
                library.getSigner()
              );

              // Get collection info from blockchain
              const collectionInfo = await collectionContract.getCollectionInfo();
              
              // Parse collection info correctly
              const collection = {
                address,
                name: collectionInfo.name,
                symbol: collectionInfo.symbol,
                owner: collectionInfo.owner_,
                totalSupply: collectionInfo.totalSupply.toNumber(),
                urlMetadata: collectionInfo.urlMetadata,
                createdAt: new Date().toISOString(),
                verified: false,
                averagePrice: null,
                volume: null
              };

              // Get media (banner/logo) from API
              try {
                const response = await axios.get(`${import.meta.env.VITE_PINATA_GATEWAY_URL}`+ collection.urlMetadata.replace('ipfs://', ''));
                const mediaData = response.data;
                collection.category = mediaData?.category;
                collection.bannerUrl = mediaData.banner.replace('ipfs://', import.meta.env.VITE_PINATA_GATEWAY_URL);
                collection.logoUrl = mediaData.image.replace('ipfs://', import.meta.env.VITE_PINATA_GATEWAY_URL);
              } catch (mediaError) {
                console.warn(`Error fetching media for collection ${address}:`, mediaError);
                collection.bannerUrl = null;
                collection.logoUrl = null;
              }

              // Get average price and volume if marketplace contract is available
              if (marketplace?.contract) {
                try {
                  const listings = await marketplace.getListingsByCollection(address);
                  if (listings.length > 0) {
                    // Calculate average price from active listings
                    const activeListings = listings.filter(l => l.isActive);
                    if (activeListings.length > 0) {
                      const prices = activeListings.map(l => parseFloat(ethers.utils.formatEther(l.price)));
                      const averagePrice = prices.reduce((sum, price) => sum + price, 0) / prices.length;
                      collection.averagePrice = averagePrice.toFixed(3);
                    }

                    // Calculate volume from completed sales
                    try {
                      const soldFilter = marketplace.contract.filters.NFTSold(null, address);
                      const currentBlock = await library.getBlockNumber();
                      const fromBlock = Math.max(0, currentBlock - 10000);
                      const soldEvents = await marketplace.contract.queryFilter(soldFilter, fromBlock);

                      if (soldEvents.length > 0) {
                        const totalVolume = soldEvents.reduce((sum, event) => {
                          const price = parseFloat(ethers.utils.formatEther(event.args.price));
                          return sum + price;
                        }, 0);
                        collection.volume = totalVolume > 0 ? totalVolume.toFixed(3) : null;
                      }
                    } catch (volumeError) {
                      console.warn(`Error calculating volume for collection ${address}:`, volumeError);
                      collection.volume = null;
                    }
                  }
                } catch (error) {
                  console.warn(`Error fetching market data for collection ${address}:`, error);
                }
              }

              return collection;
            } catch (error) {
              console.error(`Error fetching collection ${address}:`, error);
              return null;
            }
          })
        );

        // Filter out null values and set collections
        const validCollections = collectionsData.filter(collection => collection !== null);
        setCollections(validCollections);

      } catch (err) {
        console.error('Error fetching collections:', err);
        setCollectionError(err.message || 'Failed to fetch collections');
        toast.error('Failed to load collections');
      } finally {
        setLoadingCollections(false);
      }
    };

    if (active) {
      fetchCollections();
    }
  }, [library, chainId, active]);

  const handleSearch = (term) => {
    debouncedSearch(term);
  };

  const handleFilterChange = (type, value) => {
    setSearchFilters(prev => ({ ...prev, [type]: value }));
  };

  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      {/* Header with subtle gradient */}
      <div className="relative rounded-2xl p-8 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 via-blue-500/10 to-pink-500/10 blur-3xl opacity-50" />
        <div className="relative">
          <h1 className="text-4xl font-bold mb-4">
            <span className="bg-gradient-to-r from-purple-400 to-blue-500 bg-clip-text text-transparent">
              Explore Collections
            </span>
          </h1>
          <p className="text-gray-400 text-lg ">
            Discover unique NFT collections from talented artists and creators around the world.
          </p>
        </div>
      </div>

      {/* Enhanced Search Section */}
      <div className="w-full max-w-4xl mx-auto space-y-4">
        <div className="flex gap-4">
          <div className="flex-1">
            <SearchBar onSearch={handleSearch} />
          </div>
          <div className="flex gap-2">
            <select
              className="bg-dark-200/50 border border-white/10 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-neon-purple-light/50"
              value={searchFilters.sortBy}
              onChange={(e) => handleFilterChange('sortBy', e.target.value)}
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="name-asc">Name A-Z</option>
              <option value="name-desc">Name Z-A</option>
            </select>
            <select
              className="bg-dark-200/50 border border-white/10 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-neon-purple-light/50"
              value={searchFilters.category}
              onChange={(e) => handleFilterChange('category', e.target.value)}
            >
              <option value="all">All Categories</option>
              <option value="art">Art</option>
              <option value="music">Music</option>
              <option value="photography">Photography</option>
              <option value="sports">Sports</option>
              <option value="gaming">Gaming</option>
              <option value="collectibles">Collectibles</option>
              <option value="utility">Utility</option>
              <option value="other">Other</option>
            </select>
          </div>
        </div>

        {/* Search Stats */}
        <div className="flex justify-between items-center text-sm text-gray-400">
          <div>
            {loadingCollections ? (
              'Searching collections...'
            ) : (
              `Found ${filteredAndSortedCollections.length} collection${filteredAndSortedCollections.length !== 1 ? 's' : ''}`
            )}
          </div>
          {searchFilters.term && (
            <button
              onClick={() => setSearchFilters(prev => ({ ...prev, term: '' }))}
              className="text-neon-purple-light hover:text-neon-purple transition-colors"
            >
              Clear Search
            </button>
          )}
        </div>

        {/* Active Filters */}
        {(searchFilters.term || searchFilters.category !== 'all') && (
          <div className="flex flex-wrap gap-2">
            {searchFilters.term && (
              <div className="bg-neon-purple-light/10 text-neon-purple-light px-3 py-1 rounded-lg text-sm flex items-center">
                <span>Search: {searchFilters.term}</span>
                <button
                  onClick={() => setSearchFilters(prev => ({ ...prev, term: '' }))}
                  className="ml-2 hover:text-white"
                >
                  ×
                </button>
              </div>
            )}
            {searchFilters.category !== 'all' && (
              <div className="bg-neon-green-light/10 text-neon-green-light px-3 py-1 rounded-lg text-sm flex items-center">
                <span>Category: {searchFilters.category}</span>
                <button
                  onClick={() => setSearchFilters(prev => ({ ...prev, category: 'all' }))}
                  className="ml-2 hover:text-white"
                >
                  ×
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Collections Table */}
      <div className="bg-dark-200/30 rounded-xl overflow-hidden shadow-lg">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/10 bg-dark-300/30">
                <th className="px-6 py-5 text-center w-16 text-sm font-semibold text-gray-400">#</th>
                <th className="px-6 py-5 text-left text-sm font-semibold text-gray-400">Collection</th>
                <th className="px-6 py-5 text-right text-sm font-semibold text-gray-400">Average Price</th>
                <th className="px-6 py-5 text-right text-sm font-semibold text-gray-400">Volume</th>
              </tr>
            </thead>
            <tbody>
              {loadingCollections ? (
                // Loading skeletons with improved animation
                Array(6).fill(0).map((_, index) => (
                  <tr key={index} className="border-b border-white/5">
                    <td className="px-6 py-4 text-center">
                      <div className="h-4 w-4 bg-dark-300/50 rounded animate-pulse mx-auto"></div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-4">
                        <div className="h-12 w-12 rounded-full bg-dark-300/50 animate-pulse"></div>
                        <div className="h-4 w-32 bg-dark-300/50 rounded animate-pulse"></div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="h-4 w-20 bg-dark-300/50 rounded animate-pulse ml-auto"></div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="h-4 w-24 bg-dark-300/50 rounded animate-pulse ml-auto"></div>
                    </td>
                  </tr>
                ))
              ) : filteredAndSortedCollections.length > 0 ? (
                filteredAndSortedCollections.map((collection, index) => (
                  <tr 
                    key={collection.address}
                    className="border-b border-white/5 hover:bg-white/10 transition-all duration-200 cursor-pointer group"
                    onClick={() => navigate(`/collection/${collection.address}`)}
                  >
                    <td className="px-6 py-4">
                      <div className="w-full text-center font-medium text-gray-400 group-hover:text-white transition-colors">
                        {index + 1}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-4">
                        <div className="h-12 w-12 rounded-full overflow-hidden border-2 border-white/10 flex-shrink-0 bg-dark-300/50 transform group-hover:scale-110 transition-transform duration-200">
                          <img
                            src={collection.logoUrl || 'https://via.placeholder.com/48'}
                            alt={collection.name}
                            className="w-full h-full object-cover transform transition-transform group-hover:scale-105"
                            onError={(e) => {
                              e.target.src = 'https://via.placeholder.com/48';
                            }}
                          />
                        </div>
                        <div className="font-semibold text-lg text-white transform transition-all group-hover:translate-x-1 group-hover:text-neon-blue-light">
                          {collection.name}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="inline-flex items-center space-x-2 group-hover:scale-105 transition-transform">
                        <EthIcon />
                        <span className="text-white font-medium group-hover:text-neon-blue-light">
                          {collection.averagePrice ? collection.averagePrice : '---'}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="inline-flex items-center space-x-2 group-hover:scale-105 transition-transform">
                        <EthIcon />
                        <span className="text-white font-medium group-hover:text-neon-blue-light">
                          {collection.volume && collection.volume !== "0.000" ? collection.volume : '---'}
                        </span>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="4" className="px-6 py-8 text-center text-gray-400">
                    <div className="max-w-md mx-auto">
                      <p className="mb-2">
                        {searchFilters.term
                          ? `No collections found matching "${searchFilters.term}"`
                          : 'No collections found'}
                      </p>
                      {searchFilters.term && (
                        <p className="text-sm text-gray-500">
                          Try adjusting your search or filters to find what you're looking for
                        </p>
                      )}
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Explore; 