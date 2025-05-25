import { useState, useEffect } from 'react';
import { useWeb3 } from '../../hooks/useWeb3';
import NFTCard from '../common/NFTCard';
import { ethers } from 'ethers';
import { CONTRACT_ADDRESSES, NFTCollectionABI } from '../../utils/constants';

// Maximum token ID to check when we can't determine total supply
const MAX_TOKEN_ID_TO_CHECK = 50;
// Number of tokens to check in parallel
const BATCH_SIZE = 10;

const OwnedNFTs = () => {
  const { library, account, active, chainId } = useWeb3();
  const [ownedNFTs, setOwnedNFTs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchOwnedNFTs = async () => {
      if (!active || !account || !library || !chainId) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        console.log('Fetching owned NFTs for account:', account);

        // Get CollectionFactory contract to get all collections
        const factoryAddress = CONTRACT_ADDRESSES[chainId]?.collectionFactory;
        if (!factoryAddress) {
          throw new Error(`No factory address for chainId ${chainId}`);
        }

        const factoryContract = new ethers.Contract(
          factoryAddress,
          ['function getAllCollections() view returns (address[])'],
          library.getSigner()
        );

        // Get all collection addresses
        const collectionAddresses = await factoryContract.getAllCollections();
        console.log('Found collections:', collectionAddresses);

        // For each collection, check if user owns any NFTs
        const allOwnedNFTs = [];
        
        for (const collectionAddress of collectionAddresses) {
          try {
            console.log('Checking collection:', collectionAddress);
            
            // Create contract instance with basic ERC721 functions
            const nftContract = new ethers.Contract(
              collectionAddress,
              [
                'function balanceOf(address) view returns (uint256)',
                'function tokenOfOwnerByIndex(address, uint256) view returns (uint256)',
                'function totalSupply() view returns (uint256)',
                'function ownerOf(uint256) view returns (address)'
              ],
              library.getSigner()
            );

            // First try to get balance to see if user owns any NFTs in this collection
            const balance = await nftContract.balanceOf(account);
            console.log(`User owns ${balance.toString()} NFTs in collection ${collectionAddress}`);

            if (balance.gt(0)) {
              try {
                // Try to use ERC721Enumerable's tokenOfOwnerByIndex if available
                const tokenPromises = [];
                for (let i = 0; i < balance.toNumber(); i++) {
                  tokenPromises.push(nftContract.tokenOfOwnerByIndex(account, i));
                }
                
                const tokenIds = await Promise.all(tokenPromises);
                
                // Add to our list of owned NFTs
                tokenIds.forEach(id => {
                  allOwnedNFTs.push({
                    id: id.toString(),
                    contractAddress: collectionAddress
                  });
                });
                
                console.log(`Found ${tokenIds.length} NFTs using tokenOfOwnerByIndex`);
              } catch (enumError) {
                console.warn(`Collection ${collectionAddress} doesn't support ERC721Enumerable. Trying alternative approach.`);
                
                // Alternative approach: check ownership of tokens using binary search-like approach
                // This is more efficient than checking every token sequentially
                await findOwnedTokensInCollection(nftContract, account, collectionAddress, allOwnedNFTs);
              }
            }
          } catch (err) {
            console.error(`Error checking collection ${collectionAddress}:`, err);
            // Continue with other collections
          }
        }

        console.log('All owned NFTs:', allOwnedNFTs);
        setOwnedNFTs(allOwnedNFTs);
      } catch (err) {
        console.error('Error fetching owned NFTs:', err);
        setError(err.message || 'Failed to fetch owned NFTs');
      } finally {
        setLoading(false);
      }
    };

    // Helper function to find owned tokens in a collection without using enumeration
    const findOwnedTokensInCollection = async (contract, ownerAddress, collectionAddress, resultArray) => {
      let maxTokenId = 0;
      
      // Try to get total supply if available
      try {
        const totalSupply = await contract.totalSupply();
        console.log(`Collection ${collectionAddress} has ${totalSupply.toString()} total tokens`);
        maxTokenId = totalSupply.toNumber();
      } catch (supplyError) {
        console.warn(`Error getting total supply for collection ${collectionAddress}: ${supplyError.message}`);
        console.log(`Using default max token ID: ${MAX_TOKEN_ID_TO_CHECK}`);
        maxTokenId = MAX_TOKEN_ID_TO_CHECK;
      }
      
      // Limit to a reasonable number to avoid excessive calls
      const maxToCheck = Math.min(maxTokenId, 200);
      
      // Check tokens in batches to improve performance
      for (let startId = 1; startId <= maxToCheck; startId += BATCH_SIZE) {
        const endId = Math.min(startId + BATCH_SIZE - 1, maxToCheck);
        const batchPromises = [];
        
        for (let id = startId; id <= endId; id++) {
          batchPromises.push(
            (async () => {
              try {
                const owner = await contract.ownerOf(id);
                if (owner.toLowerCase() === ownerAddress.toLowerCase()) {
                  return { id: id.toString(), exists: true, owned: true };
                }
                return { id: id.toString(), exists: true, owned: false };
              } catch (err) {
                // Token might not exist or other error
                return { id: id.toString(), exists: false, owned: false };
              }
            })()
          );
        }
        
        const results = await Promise.all(batchPromises);
        
        // Add owned tokens to the result array
        results.forEach(result => {
          if (result.exists && result.owned) {
            resultArray.push({
              id: result.id,
              contractAddress: collectionAddress
            });
          }
        });
        
        // If we find a sequence of non-existent tokens, we might be past the end of the collection
        const allNonExistent = results.every(result => !result.exists);
        if (allNonExistent && startId > BATCH_SIZE) {
          console.log(`Stopping token search at ID ${startId} as tokens no longer exist`);
          break;
        }
      }
      
      console.log(`Found ${resultArray.filter(nft => nft.contractAddress === collectionAddress).length} owned NFTs in collection ${collectionAddress}`);
    };

    fetchOwnedNFTs();
  }, [library, account, active, chainId]);

  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {[...Array(8)].map((_, i) => (
          <div key={i} className="animate-pulse">
            <div className="bg-glass-white rounded-2xl aspect-square mb-4" />
            <div className="space-y-3">
              <div className="h-4 bg-glass-white rounded w-3/4" />
              <div className="h-4 bg-glass-white rounded w-1/2" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <div className="w-24 h-24 mx-auto mb-6 text-red-400">
          <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>
        <h3 className="text-xl font-semibold mb-2">Error Loading NFTs</h3>
        <p className="text-gray-400 mb-4">{error}</p>
        <button 
          onClick={() => window.location.reload()}
          className="px-4 py-2 bg-glass-white rounded-lg hover:bg-glass-dark transition-colors"
        >
          Try Again
        </button>
      </div>
    );
  }

  if (ownedNFTs.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="w-24 h-24 mx-auto mb-6 text-gray-400">
          <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        </div>
        <h3 className="text-xl font-semibold mb-2">No NFTs Found</h3>
        <p className="text-gray-400">Start collecting NFTs to see them here</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {ownedNFTs.map((nft) => (
        <NFTCard key={`${nft.contractAddress}-${nft.id}`} nft={nft} />
      ))}
    </div>
  );
};

export default OwnedNFTs; 