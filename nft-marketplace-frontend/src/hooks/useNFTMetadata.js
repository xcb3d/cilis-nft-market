import { useState, useEffect } from 'react';
import { useWeb3 } from './useWeb3';
import axios from 'axios';
import { ethers } from 'ethers';

const metadataCache = new Map();

export const useNFTMetadata = (contractAddress, tokenId) => {
  const [metadata, setMetadata] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { library, active } = useWeb3();

  useEffect(() => {
    const fetchMetadata = async () => {
      if (!active || !contractAddress || !tokenId) {
        setLoading(false);
        return;
      }

      const cacheKey = `${contractAddress}-${tokenId}`;
      if (metadataCache.has(cacheKey)) {
        setMetadata(metadataCache.get(cacheKey));
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        console.log(`Fetching metadata for NFT ${tokenId} from contract ${contractAddress}`);
        
        // Get contract instance with multiple possible interfaces
        const NFTContract = new ethers.Contract(
          contractAddress,
          [
            'function tokenURI(uint256) view returns (string)',
            'function uri(uint256) view returns (string)',  // ERC1155 style
            'function baseURI() view returns (string)',     // Some contracts use this
            'function name() view returns (string)',
            'function symbol() view returns (string)'
          ],
          library.getSigner()
        );

        // Try different methods to get token URI
        let tokenURI;
        let contractName = '';
        let contractSymbol = '';
        
        try {
          // Try to get contract name and symbol for fallback metadata
          try {
            contractName = await NFTContract.name();
          } catch (nameError) {
            console.warn(`Contract ${contractAddress} doesn't have name function`);
          }
          
          try {
            contractSymbol = await NFTContract.symbol();
          } catch (symbolError) {
            console.warn(`Contract ${contractAddress} doesn't have symbol function`);
          }
          
          // First try standard ERC721 tokenURI
          try {
            tokenURI = await NFTContract.tokenURI(tokenId);
          } catch (tokenURIError) {
            console.warn(`Contract ${contractAddress} doesn't have tokenURI function, trying alternatives`);
            
            // Try ERC1155 style uri function
            try {
              tokenURI = await NFTContract.uri(tokenId);
              // Some ERC1155 implementations use {id} placeholder
              if (tokenURI.includes('{id}')) {
                // Convert tokenId to hex and pad to 64 characters
                const hexId = ethers.BigNumber.from(tokenId).toHexString().slice(2).padStart(64, '0');
                tokenURI = tokenURI.replace('{id}', hexId);
              }
            } catch (uriError) {
              console.warn(`Contract ${contractAddress} doesn't have uri function either`);
              
              // Try baseURI + tokenId as last resort
              try {
                const baseURI = await NFTContract.baseURI();
                tokenURI = `${baseURI}${tokenId}`;
              } catch (baseURIError) {
                throw new Error('No metadata URI available for this NFT');
              }
            }
          }
        } catch (err) {
          // If all methods fail, create a fallback metadata object
          console.warn(`All methods to get token URI failed for ${contractAddress}/${tokenId}. Using fallback metadata.`);
          
          const fallbackMetadata = {
            name: contractName ? `${contractName} #${tokenId}` : `NFT #${tokenId}`,
            description: `This is token #${tokenId} from the ${contractName || 'unknown'} collection.`,
            image: null,
            attributes: []
          };
          
          setMetadata(fallbackMetadata);
          setError(null);
          setLoading(false);
          return;
        }
        
        console.log(`Token URI for ${tokenId}: ${tokenURI}`);

        // Fetch metadata from URI
        try {
          let metadataResponse;
          if (tokenURI.startsWith('ipfs://')) {
            const ipfsHash = tokenURI.replace('ipfs://', '');
            const ipfsUrl = `${import.meta.env.VITE_PINATA_GATEWAY_URL}${ipfsHash}`;
            console.log(`Fetching from IPFS gateway: ${ipfsUrl}`);
            metadataResponse = await axios.get(ipfsUrl);
          } else if (tokenURI.startsWith('data:application/json;base64,')) {
            // Handle base64 encoded JSON
            const base64Data = tokenURI.replace('data:application/json;base64,', '');
            const jsonString = atob(base64Data);
            metadataResponse = { data: JSON.parse(jsonString) };
            console.log('Decoded base64 metadata');
          } else {
            console.log(`Fetching from HTTP URL: ${tokenURI}`);
            metadataResponse = await axios.get(tokenURI);
          }

          // If image is IPFS, convert to HTTP gateway URL
          const metadata = metadataResponse.data;
          if (metadata.image && metadata.image.startsWith('ipfs://')) {
            metadata.image = metadata.image.replace(
              'ipfs://', 
              import.meta.env.VITE_PINATA_GATEWAY_URL
            );
          }

          console.log(`Metadata for NFT ${tokenId}:`, metadata);
          setMetadata(metadata);
          setError(null);
        } catch (fetchError) {
          console.error(`Error fetching metadata from URI ${tokenURI}:`, fetchError);
          
          // Create a minimal fallback metadata if URI fetch fails
          const fallbackMetadata = {
            name: contractName ? `${contractName} #${tokenId}` : `NFT #${tokenId}`,
            description: `This is token #${tokenId} from the ${contractName || 'unknown'} collection.`,
            image: null,
            attributes: []
          };
          
          setMetadata(fallbackMetadata);
          setError(`Could not fetch metadata: ${fetchError.message}`);
        }
      } catch (err) {
        console.error(`Error fetching NFT metadata for ${tokenId} from ${contractAddress}:`, err);
        setError(err.message || 'Failed to fetch NFT metadata');
        setMetadata(null);
      } finally {
        setLoading(false);
      }
    };

    fetchMetadata();
  }, [contractAddress, tokenId, library, active]);

  return { metadata, loading, error };
}; 