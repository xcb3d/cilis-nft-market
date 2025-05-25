import { useState } from 'react';
import { toast } from 'react-hot-toast';
import { ethers } from 'ethers';

export const useNFTOperations = (marketplace, nftCollection, account) => {
  const [isListing, setIsListing] = useState(false);
  const [isApproving, setIsApproving] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);
  const [isBuying, setIsBuying] = useState(false);

  const listNFT = async (collectionAddress, tokenId, listingPrice, onSuccess) => {
    if (!marketplace || !nftCollection || !account) {
      throw new Error('Missing required components');
    }
    
    try {
      setIsListing(true);
      
      const isApproved = await nftCollection.isApprovedForMarketplace(tokenId);
      
      if (!isApproved) {
        setIsApproving(true);
        await nftCollection.approve(tokenId);
        setIsApproving(false);
      }
      
      const listingId = await marketplace.listNFT(collectionAddress, tokenId, listingPrice);
      
      const listing = {
        id: listingId,
        collection: collectionAddress,
        tokenId,
        seller: account,
        price: listingPrice,
        isActive: true
      };

      onSuccess?.(listing);
      return listing;
      
    } finally {
      setIsListing(false);
      setIsApproving(false);
    }
  };

  const cancelListing = async (listingId, onSuccess) => {
    if (!marketplace || !account) {
      throw new Error('Missing required components');
    }
    
    try {
      setIsCancelling(true);
      await marketplace.cancelListing(listingId);
      onSuccess?.();
    } finally {
      setIsCancelling(false);
    }
  };

  const buyNFT = async (listingId, price, onSuccess) => {
    if (!marketplace || !account) {
      throw new Error('Missing required components');
    }
    
    try {
      setIsBuying(true);
      await marketplace.buyNFT(listingId, price);
      onSuccess?.();
      toast.success('Congratulations! You have successfully purchased this NFT.');
    } finally {
      setIsBuying(false);
    }
  };

  return {
    isListing,
    isApproving,
    isCancelling,
    isBuying,
    listNFT,
    cancelListing,
    buyNFT
  };
}; 