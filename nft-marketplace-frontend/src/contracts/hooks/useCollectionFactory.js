import { useState, useEffect, useCallback } from 'react';
import { ethers } from 'ethers';
import { useWeb3 } from '../../hooks/useWeb3';
import { CONTRACT_ADDRESSES, CollectionFactoryABI, NFTCollectionABI } from '../../utils/constants';

// Helper function to add timeout to promises
const withTimeout = (promise, ms) => {
  const timeout = new Promise((_, reject) => {
    const id = setTimeout(() => {
      clearTimeout(id);
      reject(new Error(`Timed out after ${ms}ms`));
    }, ms);
  });

  return Promise.race([promise, timeout]);
};

export const useCollectionFactory = () => {
  const { library, chainId, account, active } = useWeb3();
  const [contract, setContract] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Initialize contract when library and chainId are available
  useEffect(() => {
    if (!library || !chainId) {
      console.log('Library or chainId not available yet');
      return;
    }

    try {
      const address = CONTRACT_ADDRESSES[chainId]?.collectionFactory;
      if (!address) {
        console.error(`No contract address for chainId ${chainId}`);
        setError(`No contract address for chainId ${chainId}`);
        return;
      }

      const factoryContract = new ethers.Contract(
        address,
        CollectionFactoryABI.abi,
        library.getSigner()
      );
      
      console.log('CollectionFactory contract initialized:', address);
      setContract(factoryContract);
      setError(null);
    } catch (err) {
      console.error('Error initializing CollectionFactory contract:', err);
      setError(err.message || 'Failed to initialize contract');
      setContract(null);
    }
  }, [library, chainId]);

  // Log contract state changes for debugging
  useEffect(() => {
    console.log('CollectionFactory contract state:', { 
      isInitialized: !!contract,
      chainId,
      active
    });
  }, [contract, chainId, active]);

  const createCollection = async (name, symbol, baseURI, urlMetadata) => {
    if (!contract) throw new Error('Contract not initialized');
    if (!active) throw new Error('Wallet not connected');
    
    try {
      setLoading(true);
      console.log(`Creating collection: ${name} (${symbol}) with baseURI: ${baseURI} and metadata: ${urlMetadata}`);
      
      const tx = await contract.createCollection(name, symbol, baseURI, urlMetadata);
      console.log('Transaction sent:', tx.hash);
      
      const receipt = await tx.wait();
      console.log('Transaction confirmed:', receipt);
      
      // Get the collection address from the event
      const event = receipt.events.find(e => e.event === 'CollectionCreated');
      const collectionAddress = event.args.collectionAddress;
      
      console.log('Collection created at address:', collectionAddress);
      return collectionAddress;
    } catch (err) {
      console.error('Error creating collection:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const getCollectionsByOwner = useCallback(async (ownerAddress) => {
    if (!contract) {
      console.error('Contract not initialized in getCollectionsByOwner');
      return [];
    }
    
    if (!ownerAddress) {
      console.error('Owner address is required');
      return [];
    }
    
    try {
      console.log(`Fetching collections for owner: ${ownerAddress} (start)`);
      setLoading(true);
      
      // Add timeout to prevent hanging
      const collections = await withTimeout(
        contract.getCollectionsByOwner(ownerAddress),
        10000 // 10 seconds timeout
      );
      
      console.log(`Fetching collections for owner: ${ownerAddress} (complete)`, collections);
      return collections;
    } catch (err) {
      console.error(`Error fetching collections for owner ${ownerAddress}:`, err);
      // Return empty array instead of throwing to prevent UI from breaking
      return [];
    } finally {
      setLoading(false);
    }
  }, [contract]);

  const getAllCollections = async () => {
    if (!contract) throw new Error('Contract not initialized');
    
    try {
      setLoading(true);
      
      // Add timeout to prevent hanging
      const collectionAddresses = await withTimeout(
        contract.getAllCollections(),
        10000 // 10 seconds timeout
      );
      
      console.log('Got collection addresses:', collectionAddresses);
      
      // Fetch details for each collection
      const collectionsWithDetails = await Promise.all(
        collectionAddresses.map(async (address) => {
          try {
            console.log('Fetching details for collection:', address);
            
            const collectionContract = new ethers.Contract(
              address,
              NFTCollectionABI.abi,
              library.getSigner()
            );

            console.log('Created contract instance for:', address);
            
            const collectionInfo = await collectionContract.getCollectionInfo();
            console.log('Raw collection info:', collectionInfo);
            
            const [name, symbol, owner, totalSupply, urlMetadata] = collectionInfo;
            console.log('Parsed collection info:', { name, symbol, owner, totalSupply: totalSupply.toString(), urlMetadata });

            const collection = {
              address,
              name,
              symbol,
              owner,
              totalSupply: totalSupply.toNumber(),
              urlMetadata: urlMetadata || null
            };

            console.log('Formatted collection object:', collection);
            return collection;
          } catch (error) {
            console.error(`Error fetching collection details for ${address}:`, error);
            return null;
          }
        })
      );

      // Filter out any failed fetches
      const validCollections = collectionsWithDetails.filter(c => c !== null);
      
      console.log('All collections with details:', validCollections);
      return validCollections;
    } catch (err) {
      console.error('Error fetching all collections:', err);
      // Return empty array instead of throwing
      return [];
    } finally {
      setLoading(false);
    }
  };

  // Listen for CollectionCreated events
  const listenToCollectionCreated = useCallback((callback) => {
    if (!contract) return () => {};
    
    const filter = contract.filters.CollectionCreated(null, account);
    
    const listener = (collectionAddress, owner, name, symbol, urlMetadata) => {
      console.log('Collection created event:', { collectionAddress, owner, name, symbol, urlMetadata });
      if (callback) callback({ collectionAddress, owner, name, symbol, urlMetadata });
    };
    
    contract.on(filter, listener);
    
    return () => {
      contract.off(filter, listener);
    };
  }, [contract, account]);

  return {
    contract,
    loading,
    error,
    createCollection,
    getCollectionsByOwner,
    getAllCollections,
    listenToCollectionCreated
  };
}; 