import { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { ERC721_ABI, MARKETPLACE_EVENTS_ABI } from '../pages/NFTDetail/constants';

export const useNFTTransactionHistory = (library, marketplace, collectionAddress, tokenId) => {
  const [transactionHistory, setTransactionHistory] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(true);
  const [transactionHistoryError, setTransactionHistoryError] = useState(null);

  const filterEventsByTokenId = (events) => {
    return events.filter(event => {
      try {
        const eventTokenId = ethers.BigNumber.from(event.topics[3]).toString();
        return eventTokenId === tokenId.toString();
      } catch {
        return false;
      }
    });
  };

  const fetchTransactionHistory = async () => {
    if (!library) return;
    
    try {
      setLoadingHistory(true);
      setTransactionHistoryError(null);
      
      if (!collectionAddress || !ethers.utils.isAddress(collectionAddress)) {
        throw new Error('Invalid collection address');
      }
      if (!tokenId || isNaN(parseInt(tokenId))) {
        throw new Error('Invalid token ID');
      }
      
      const marketplaceAddress = marketplace.contract?.address;
      if (!marketplaceAddress) return;

      const marketplaceEventContract = new ethers.Contract(marketplaceAddress, MARKETPLACE_EVENTS_ABI, library);
      const nftEventContract = new ethers.Contract(collectionAddress, ERC721_ABI, library);
      
      const currentBlock = await library.getBlockNumber();
      const fromBlock = Math.max(0, currentBlock - 10000);
      
      const [listedEvents, soldEvents, canceledEvents, transferEvents] = await Promise.all([
        marketplaceEventContract.queryFilter({
          address: marketplaceAddress,
          topics: [ethers.utils.id("NFTListed(uint256,address,uint256,address,uint256)"), null, ethers.utils.hexZeroPad(collectionAddress, 32)]
        }, fromBlock),
        marketplaceEventContract.queryFilter({
          address: marketplaceAddress, 
          topics: [ethers.utils.id("NFTSold(uint256,address,uint256,address,address,uint256)"), null, ethers.utils.hexZeroPad(collectionAddress, 32)]
        }, fromBlock),
        marketplaceEventContract.queryFilter({
          address: marketplaceAddress,
          topics: [ethers.utils.id("ListingCanceled(uint256,address,uint256)"), null, ethers.utils.hexZeroPad(collectionAddress, 32)]
        }, fromBlock),
        nftEventContract.queryFilter({
          topics: [ethers.utils.id("Transfer(address,address,uint256)"), null, null, ethers.utils.hexZeroPad(ethers.BigNumber.from(tokenId).toHexString(), 32)]
        }, fromBlock)
      ]);

      const filteredListedEvents = filterEventsByTokenId(listedEvents);
      const filteredSoldEvents = filterEventsByTokenId(soldEvents); 
      const filteredCanceledEvents = filterEventsByTokenId(canceledEvents);

      const historyItems = [];

      for (const event of transferEvents) {
        const from = ethers.utils.getAddress('0x' + event.topics[1].slice(26));
        const to = ethers.utils.getAddress('0x' + event.topics[2].slice(26));
        
        const isMarketplaceTransfer = filteredSoldEvents.some(soldEvent => {
          const soldBlock = soldEvent.blockNumber;
          const soldFrom = '0x' + soldEvent.data.slice(26, 66);
          const soldTo = '0x' + soldEvent.data.slice(90, 130);
          return soldBlock === event.blockNumber && soldFrom === from && soldTo === to;
        });

        if (!isMarketplaceTransfer) {
          historyItems.push({
            type: 'transferred',
            timestamp: (await library.getBlock(event.blockNumber)).timestamp * 1000,
            from,
            to,
            price: null,
            blockNumber: event.blockNumber
          });
        }
      }

      for (const event of filteredListedEvents) {
        const listingId = ethers.BigNumber.from(event.topics[1]).toString();
        const seller = '0x' + event.data.slice(26, 66);
        const price = ethers.BigNumber.from('0x' + event.data.slice(66)).toString();
        
        historyItems.push({
          type: 'listed',
          timestamp: (await library.getBlock(event.blockNumber)).timestamp * 1000,
          from: seller,
          to: null,
          price: ethers.utils.formatEther(price),
          listingId: listingId,
          blockNumber: event.blockNumber
        });
      }

      for (const event of filteredSoldEvents) {
        const listingId = ethers.BigNumber.from(event.topics[1]).toString();
        const seller = '0x' + event.data.slice(26, 66);
        const buyer = '0x' + event.data.slice(90, 130);
        const price = ethers.BigNumber.from('0x' + event.data.slice(130)).toString();
        
        historyItems.push({
          type: 'sold',
          timestamp: (await library.getBlock(event.blockNumber)).timestamp * 1000,
          from: seller,
          to: buyer,
          price: ethers.utils.formatEther(price),
          listingId: listingId,
          blockNumber: event.blockNumber
        });
      }

      for (const event of filteredCanceledEvents) {
        const listingId = ethers.BigNumber.from(event.topics[1]).toString();
        const originalListing = historyItems.find(item => item.type === 'listed' && item.listingId === listingId);
        
        historyItems.push({
          type: 'cancelled',
          timestamp: (await library.getBlock(event.blockNumber)).timestamp * 1000,
          from: originalListing?.from || 'Unknown',
          to: null,
          price: originalListing?.price || null,
          listingId: listingId,
          blockNumber: event.blockNumber
        });
      }
      
      historyItems.sort((a, b) => a.blockNumber - b.blockNumber);
      setTransactionHistory(historyItems);
    } catch (error) {
      setTransactionHistoryError(error.message);
    } finally {
      setLoadingHistory(false);
    }
  };

  useEffect(() => {
    if (library && marketplace.contract) {
      fetchTransactionHistory();
    }
  }, [library, marketplace.contract, collectionAddress, tokenId]);

  return {
    transactionHistory,
    loadingHistory,
    transactionHistoryError,
    fetchTransactionHistory
  };
}; 