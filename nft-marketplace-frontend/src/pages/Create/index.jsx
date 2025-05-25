import { useState, useEffect } from 'react';
import { useWeb3 } from '../../hooks/useWeb3';
import { ethers } from 'ethers';
import { CONTRACT_ADDRESSES, CollectionFactoryABI, NFTCollectionABI } from '../../utils/constants';
import CreateCollection from '../../components/create/CreateCollection';
import MintNFT from '../../components/create/MintNFT';
import ActiveButton from '../../components/common/ActiveButton';

const Create = () => {
  const [activeTab, setActiveTab] = useState('collection');
  const { account, active, library, chainId } = useWeb3();
  const [collections, setCollections] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Handle new collection creation
  const handleCollectionCreated = (newCollection) => {
    setCollections(prevCollections => [...prevCollections, {
      address: newCollection.address,
      name: newCollection.name,
      symbol: newCollection.symbol,
      owner: newCollection.owner,
      totalSupply: 0
    }]);
    // Automatically switch to NFT creation tab
    setActiveTab('nft');
  };

  // Fetch user's collections
  useEffect(() => {
    const fetchUserCollections = async () => {
      if (!active || !account || !library || !chainId) {
        return;
      }
      
      try {
        setLoading(true);
        setError(null);
        
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
        
        // Set timeout for the call
        const timeoutPromise = new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Request timed out after 15s')), 15000)
        );
        
        // Call getCollectionsByOwner with timeout
        const collectionAddresses = await Promise.race([
          factoryContract.getCollectionsByOwner(account),
          timeoutPromise
        ]);
        
        // Fetch details for each collection
        const collectionsWithDetails = await Promise.all(
          collectionAddresses.map(async (address) => {
            try {
              const collectionContract = new ethers.Contract(
                address,
                NFTCollectionABI.abi,
                library.getSigner()
              );
              
              const info = await collectionContract.getCollectionInfo();
              
              return {
                address,
                name: info.name,
                symbol: info.symbol,
                owner: info.owner,
                totalSupply: Number(info.totalSupply)
              };
            } catch (err) {
              console.error(`Error fetching details for collection ${address}:`, err);
              return { address, name: `Collection (${address.slice(0, 6)}...${address.slice(-4)})` };
            }
          })
        );
        
        setCollections(collectionsWithDetails);
      } catch (err) {
        console.error('Error fetching collections:', err);
        setError(err.message || 'Failed to fetch collections');
      } finally {
        setLoading(false);
      }
    };
    
    fetchUserCollections();
  }, [account, active, library, chainId]);

  const tabs = [
    { id: 'collection', name: 'Create Collection' },
    { id: 'nft', name: 'Create NFT' },
  ];

  return (
    <div className="py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-display font-bold">
            <span className="heading-gradient">Create</span>
          </h1>
          <p className="mt-4 text-gray-400 text-lg">
            Create your own NFT collection or mint new NFTs
          </p>
        </div>

        {/* Tabs */}
        <div className="flex justify-center mb-8">
          <div className="glass-panel p-1 inline-flex rounded-xl">
            {tabs.map((tab) => (
              <ActiveButton key={tab.id} isActive={activeTab === tab.id} onClick={() => setActiveTab(tab.id)}>
                {tab.name}
              </ActiveButton>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="mt-8">
          {activeTab === 'collection' ? (
            <CreateCollection onCollectionCreated={handleCollectionCreated} />
          ) : (
            <>
              {!active ? (
                <div className="glass-panel p-8 text-center">
                  <h3 className="text-xl font-semibold mb-4">Connect Your Wallet</h3>
                  <p className="text-gray-400">Please connect your wallet to create NFTs</p>
                </div>
              ) : loading ? (
                <div className="glass-panel p-8 text-center">
                  <div className="animate-spin w-10 h-10 border-4 border-neon-purple border-t-transparent rounded-full mx-auto mb-4"></div>
                  <p className="text-gray-400">Loading your collections...</p>
                </div>
              ) : error ? (
                <div className="glass-panel p-8 text-center">
                  <h3 className="text-xl font-semibold mb-4 text-red-500">Error</h3>
                  <p className="text-gray-400">{error}</p>
                  <button 
                    onClick={() => window.location.reload()} 
                    className="mt-4 px-4 py-2 bg-cyan-500/20 hover:bg-cyan-500/30 rounded-lg transition-colors"
                  >
                    Retry
                  </button>
                </div>
              ) : collections.length === 0 ? (
                <div className="glass-panel p-8 text-center">
                  <h3 className="text-xl font-semibold mb-4">No Collections Found</h3>
                  <p className="text-gray-400 mb-4">You need to create a collection before minting NFTs</p>
                  <button 
                    onClick={() => setActiveTab('collection')} 
                    className="px-6 py-3 bg-gradient-to-r from-cyan-400 to-cyan-600 rounded-lg text-sm font-medium hover:opacity-90 transition-all"
                  >
                    Create Collection
                  </button>
                </div>
              ) : (
                <MintNFT collections={collections} />
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Create; 