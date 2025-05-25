import { useState, useEffect } from 'react';
import { useWeb3 } from './useWeb3';
import { ethers } from 'ethers';
import { CONTRACT_ADDRESSES, CollectionFactoryABI, NFTCollectionABI } from '../utils/constants';
import { ERC721_ABI, NFT_MINTED_EVENT } from '../pages/NFTDetail/constants';
import { fetchCollectionMetadata } from '../services/collectionMetadata';
import { normalizeIPFSUrl } from '../utils/algorithm';

const fetchWithFallback = async (url) => {
  url = normalizeIPFSUrl(url);
  if (!url.includes('/ipfs/')) {
    return fetch(url);
  }
  
  const ipfsHashMatch = url.match(/ipfs\/([a-zA-Z0-9]{46}|[a-zA-Z0-9]{59})/);
  if (!ipfsHashMatch || !ipfsHashMatch[1]) {
    throw new Error(`Invalid IPFS URL: ${url}`);
  }
  
  const ipfsHash = ipfsHashMatch[1];
  
  const gateway = import.meta.env.VITE_PINATA_GATEWAY_URL;
  const gatewayUrl = `${gateway}${ipfsHash}`;
  
  const response = await fetch(gatewayUrl);
  if (!response.ok) {
    throw new Error(`Failed to fetch from gateway ${gateway}`);
  }
  
  return response;
};

/**
 * Custom hook to fetch collections data
 * @param {string} [collectionAddress] - Optional collection address. If provided, fetches details for that collection
 * @returns {Object} Collections data and related state
 */
export const useCollections = (collectionAddress) => {
  const { account, active, library, chainId } = useWeb3();
  const [collections, setCollections] = useState([]);
  const [collection, setCollection] = useState(null);
  const [metadata, setMetadata] = useState(null);
  const [nfts, setNfts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [contractStatus, setContractStatus] = useState('Connecting to contract...');
  const [refreshCounter, setRefreshCounter] = useState(0);

  // Fetch NFT details for a specific collection
  const fetchNFTDetails = async (contract, tokenId) => {
    try {
      console.log(`Fetching details for token ID ${tokenId}...`);
      
      // Check if token exists by trying to get its owner
      let owner;
      try {
        owner = await contract.ownerOf(tokenId);
        console.log(`Token ${tokenId} owner:`, owner);
      } catch (err) {
        console.warn(`Token ${tokenId} doesn't exist or can't be accessed:`, err);
        return null;
      }
      
      // Get token URI
      let tokenURI;
      try {
        tokenURI = await contract.tokenURI(tokenId);
        console.log(`Token ${tokenId} URI:`, tokenURI);
      } catch (err) {
        console.warn(`Could not get tokenURI for token ${tokenId}:`, err);
        tokenURI = '';
      }
      
      // Normalize the token URI
      tokenURI = normalizeIPFSUrl(tokenURI);
      console.log(`Normalized token URI: ${tokenURI}`);
      
      // Fetch metadata from token URI
      let metadata = {};
      if (tokenURI) {
        try {
          console.log(`Fetching metadata from ${tokenURI}...`);
          
          const response = await fetchWithFallback(tokenURI);
          metadata = await response.json();
          console.log(`Metadata for token ${tokenId}:`, metadata);
          
          // Normalize image URL if it exists
          if (metadata.image) {
            metadata.image = normalizeIPFSUrl(metadata.image);
            console.log(`Normalized image URL: ${metadata.image}`);
          }
        } catch (err) {
          console.warn(`Could not fetch metadata for token ${tokenId}:`, err);
        }
      }
      
      // Get creator from blockchain
      let creator;
      try {
        creator = await contract.getCreator(tokenId);
        console.log(`Creator for token ${tokenId}:`, creator);
      } catch (err) {
        console.warn(`Could not get creator for token ${tokenId}:`, err);
        creator = metadata.creator || collection?.owner || '';
      }

      console.log('Metadata:', metadata);
      
      const nftData = {
        id: tokenId,
        name: metadata.name || `NFT #${tokenId}`,
        description: metadata.description || '',
        image: metadata.image || 'https://images.unsplash.com/photo-1634973357973-f2ed2657db3c?w=400&h=400&fit=crop',
        attributes: metadata.attributes || [],
        collection: collection?.name || '',
        owner,
        tokenURI,
        likes: Math.floor(Math.random() * 100), // Mock data
        creator: creator,
        createdAt: metadata.created_at || metadata.createdAt || metadata.date || '',
        price: (Math.random() * 2 + 0.1).toFixed(2), // Mock price
      };
      
      console.log(`Successfully processed NFT ${tokenId}`);
      return nftData;
    } catch (err) {
      console.warn(`Error fetching NFT ${tokenId}:`, err);
      return null;
    }
  };

  // Fetch collection details and NFTs
  const fetchCollectionDetails = async (address) => {
    try {
      console.log("Creating contract instance for collection:", address);
      
      // Create contract instance with combined ABI
      const contract = new ethers.Contract(
        address,
        [...ERC721_ABI, ...NFT_MINTED_EVENT, ...NFTCollectionABI.abi], // Combine all ABIs
        library.getSigner()
      );

      // Collection info variables
      let name, symbol, owner, totalSupply;

      try {
        console.log("Trying to fetch collection info using getCollectionInfo()...");
        // Try to fetch collection details using getCollectionInfo()
        const collectionInfo = await contract.getCollectionInfo();
        console.log("Collection info received:", collectionInfo);
        
        // Extract values from the returned array
        [name, symbol, owner, totalSupply] = collectionInfo;
      } catch (infoErr) {
        console.warn("getCollectionInfo failed, falling back to ERC721 methods:", infoErr);
        
        // Fallback to standard ERC721 methods
        try {
          // Create a contract with just ERC721 ABI
          const erc721Contract = new ethers.Contract(
            address,
            ERC721_ABI,
            library.getSigner()
          );
          
          // Fetch basic collection info
          [name, symbol, totalSupply] = await Promise.all([
            erc721Contract.name(),
            erc721Contract.symbol(),
            erc721Contract.totalSupply()
          ]);
          
          // For owner, we'll use the connected account as a fallback
          owner = account;
          
          console.log("Successfully fetched collection info using ERC721 methods");
        } catch (erc721Err) {
          console.error("Failed to fetch collection info using ERC721 methods:", erc721Err);
          throw new Error("Could not fetch collection information");
        }
      }

      const collectionData = {
        address,
        name,
        symbol,
        owner,
        totalSupply: totalSupply.toNumber(),
      };

      setCollection(collectionData);

      // Fetch metadata
      try {
        const metadataResult = await fetchCollectionMetadata(address);
        setMetadata(metadataResult);
      } catch (metadataErr) {
        console.warn('Could not fetch collection metadata:', metadataErr);
      }

      // Fetch NFTs if this is a single collection view
      if (collectionAddress) {
        setContractStatus('Fetching NFTs...');
        
        // Fetch NFTs
        const nftPromises = [];
        const totalSupplyNumber = totalSupply.toNumber();
        
        console.log(`Found ${totalSupplyNumber} NFTs in collection, fetching details...`);
        
        // Limit to 100 NFTs for performance
        const maxNFTs = Math.min(totalSupplyNumber, 100);
        
        for (let i = 1; i <= maxNFTs; i++) {
          nftPromises.push(fetchNFTDetails(contract, i));
        }

        const nftResults = await Promise.all(nftPromises);
        const validNfts = nftResults.filter(nft => nft !== null);
        console.log(`Successfully fetched ${validNfts.length} NFTs`);
        setNfts(validNfts);
        setContractStatus(`Found ${validNfts.length} NFTs`);
      }

      return collectionData;
    } catch (err) {
      console.error('Error fetching collection details:', err);
      throw err;
    }
  };

  // Main effect to fetch collections
  useEffect(() => {
    if (!active || !library || (!collectionAddress && !account) || !chainId) {
      setContractStatus('Please connect your wallet');
      setLoading(false);
      return;
    }
    
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        setContractStatus('Connecting to contract...');
        
        if (collectionAddress) {
          // Single collection mode
          await fetchCollectionDetails(collectionAddress);
        } else {
          // User collections mode
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
          
          setContractStatus('Fetching collections...');
          
          // Set timeout for the call
          const timeoutPromise = new Promise((_, reject) => 
            setTimeout(() => reject(new Error('Request timed out after 15s')), 15000)
          );
          
          // Call getCollectionsByOwner with timeout
          const userCollections = await Promise.race([
            factoryContract.getCollectionsByOwner(account),
            timeoutPromise
          ]);
          
          setCollections(userCollections);
          setContractStatus(`Found ${userCollections.length} collections`);
        }
      } catch (err) {
        console.error('Error fetching collections:', err);
        setError(err.message || 'Failed to fetch collections');
        setContractStatus('Error connecting to contract');
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [account, active, library, chainId, collectionAddress, refreshCounter]);

  // Handle manual refresh
  const handleRefresh = () => {
    setRefreshCounter(prev => prev + 1);
  };

  return {
    // For user collections view
    collections,
    // For single collection view
    collection,
    metadata,
    nfts,
    // Common states
    loading,
    error,
    contractStatus,
    handleRefresh
  };
};