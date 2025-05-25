import { useMemo } from 'react';
import { ethers } from 'ethers';
import { useWeb3 } from '../../hooks/useWeb3';
import { NFTCollectionABI, CONTRACT_ADDRESSES } from '../../utils/constants';

// ERC721 ABI with approval functions
const ERC721_ABI = [
  "function ownerOf(uint256 tokenId) view returns (address)",
  "function getApproved(uint256 tokenId) view returns (address)",
  "function approve(address to, uint256 tokenId) external"
];

export const useNFTCollection = (collectionAddress) => {
  const { library, account, chainId } = useWeb3();

  const contract = useMemo(() => {
    if (!library || !collectionAddress) return null;

    return new ethers.Contract(
      collectionAddress,
      NFTCollectionABI.abi,
      library.getSigner()
    );
  }, [library, collectionAddress]);

  // Create a separate contract instance with ERC721 ABI for approval functions
  const erc721Contract = useMemo(() => {
    if (!library || !collectionAddress) return null;

    return new ethers.Contract(
      collectionAddress,
      ERC721_ABI,
      library.getSigner()
    );
  }, [library, collectionAddress]);

  const mint = async (tokenURI) => {
    if (!contract || !account) throw new Error('Contract not initialized');

    try {
      const tx = await contract.mint(tokenURI);
      const receipt = await tx.wait();
      
      // Get tokenId from event
      const event = receipt.events?.find(e => e.event === 'NFTMinted');
      return event?.args?.tokenId;
    } catch (error) {
      console.error('Mint NFT error:', error);
      throw error;
    }
  };

  const getCollectionInfo = async () => {
    if (!contract) throw new Error('Contract not initialized');
    
    try {
      const info = await contract.getCollectionInfo();
      return {
        name: info[0],
        symbol: info[1],
        owner: info[2],
        totalSupply: info[3]
      };
    } catch (error) {
      console.error('Get collection info error:', error);
      throw error;
    }
  };

  const setBaseURI = async (baseURI) => {
    if (!contract || !account) throw new Error('Contract not initialized');

    try {
      const tx = await contract.setBaseURI(baseURI);
      await tx.wait();
    } catch (error) {
      console.error('Set base URI error:', error);
      throw error;
    }
  };

  const approve = async (tokenId) => {
    if (!erc721Contract || !account || !chainId) throw new Error('Contract not initialized');

    try {
      const marketplaceAddress = CONTRACT_ADDRESSES[chainId]?.marketplace;
      if (!marketplaceAddress) throw new Error('Marketplace address not found');

      console.log('Approving NFT', tokenId, 'for marketplace', marketplaceAddress);
      const tx = await erc721Contract.approve(marketplaceAddress, tokenId);
      await tx.wait();
      return true;
    } catch (error) {
      console.error('Approve NFT error:', error);
      throw error;
    }
  };

  const isApprovedForMarketplace = async (tokenId) => {
    if (!erc721Contract || !chainId) throw new Error('Contract not initialized');

    try {
      const marketplaceAddress = CONTRACT_ADDRESSES[chainId]?.marketplace;
      if (!marketplaceAddress) throw new Error('Marketplace address not found');

      console.log('Checking approval for NFT', tokenId, 'marketplace', marketplaceAddress);
      const approvedAddress = await erc721Contract.getApproved(tokenId);
      console.log('Approved address:', approvedAddress);
      return approvedAddress.toLowerCase() === marketplaceAddress.toLowerCase();
    } catch (error) {
      console.error('Check approval error:', error);
      throw error;
    }
  };

  return {
    contract,
    mint,
    getCollectionInfo,
    setBaseURI,
    approve,
    isApprovedForMarketplace
  };
}; 