import { ethers } from 'ethers';
import { getMarketplaceContract, getNFTContract } from './contracts';
import { normalizeIPFSUrl } from './algorithm';

/**
 * Fetches transaction history for a specific NFT
 * @param {string} collectionAddress - The NFT collection contract address
 * @param {string} tokenId - The token ID of the NFT
 * @param {object} provider - The ethers provider
 * @param {function} setIsLoading - Function to update loading state
 * @param {function} setError - Function to update error state
 * @return {Array} - Array of transaction history objects
 */
export const fetchTransactionHistory = async (
  collectionAddress,
  tokenId,
  provider,
  setIsLoading = () => {},
  setError = () => {}
) => {
  try {
    setIsLoading(true);
    
    // Get contract instances
    const marketplaceContract = getMarketplaceContract(provider);
    const nftContract = getNFTContract(collectionAddress, provider);
    
    // Fetch all events related to this NFT
    const filter = marketplaceContract.filters.NFTTransactionEvent(null, collectionAddress, tokenId);
    const events = await marketplaceContract.queryFilter(filter);
    
    // Get mint event from NFT contract
    const transferFilter = nftContract.filters.Transfer(ethers.constants.AddressZero, null, tokenId);
    const transferEvents = await nftContract.queryFilter(transferFilter);
    
    const mintEvent = transferEvents.length > 0 ? transferEvents[0] : null;
    
    // Process events into history items
    const history = [];
    
    // Add mint event if found
    if (mintEvent) {
      const block = await mintEvent.getBlock();
      const timestamp = new Date(block.timestamp * 1000);
      
      history.push({
        type: 'Mint',
        from: ethers.constants.AddressZero,
        to: mintEvent.args.to,
        price: '0',
        timestamp,
        transactionHash: mintEvent.transactionHash
      });
    }
    
    // Process marketplace events
    for (const event of events) {
      const eventName = event.event;
      const args = event.args;
      
      const block = await event.getBlock();
      const timestamp = new Date(block.timestamp * 1000);
      
      if (eventName === 'NFTTransactionEvent') {
        const [transactionType, , , seller, buyer, price] = args;
        
        history.push({
          type: transactionType,
          from: seller,
          to: buyer,
          price: ethers.utils.formatEther(price),
          timestamp,
          transactionHash: event.transactionHash
        });
      }
    }
    
    // Sort by timestamp (newest first)
    history.sort((a, b) => b.timestamp - a.timestamp);
    
    return history;
  } catch (error) {
    console.error('Error fetching transaction history:', error);
    setError('Failed to load transaction history. Please try again later.');
    return [];
  } finally {
    setIsLoading(false);
  }
};

/**
 * Fetches NFT ownership history
 * @param {string} collectionAddress - The NFT collection contract address
 * @param {string} tokenId - The token ID of the NFT
 * @param {object} provider - The ethers provider
 * @return {Array} - Array of ownership history objects
 */
export const fetchOwnershipHistory = async (collectionAddress, tokenId, provider) => {
  try {
    const nftContract = getNFTContract(collectionAddress, provider);
    
    // Get all Transfer events for this token
    const filter = nftContract.filters.Transfer(null, null, tokenId);
    const events = await nftContract.queryFilter(filter);
    
    const history = [];
    
    for (const event of events) {
      const block = await event.getBlock();
      const timestamp = new Date(block.timestamp * 1000);
      
      history.push({
        from: event.args.from,
        to: event.args.to,
        timestamp,
        transactionHash: event.transactionHash
      });
    }
    
    // Sort by timestamp (newest first)
    history.sort((a, b) => b.timestamp - a.timestamp);
    
    return history;
  } catch (error) {
    console.error('Error fetching ownership history:', error);
    return [];
  }
};