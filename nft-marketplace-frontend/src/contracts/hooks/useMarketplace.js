import { useMemo } from 'react';
import { ethers } from 'ethers';
import { useWeb3 } from '../../hooks/useWeb3';
import { CONTRACT_ADDRESSES, MarketplaceABI } from '../../utils/constants';
import { normalizeIPFSUrl } from '../../utils/algorithm';

export const useMarketplace = () => {
  const { library, account, chainId } = useWeb3();

  const contract = useMemo(() => {
    if (!library || !chainId) return null;
    
    const address = CONTRACT_ADDRESSES[chainId]?.marketplace;
    if (!address) return null;

    return new ethers.Contract(
      address,
      MarketplaceABI.abi,
      library.getSigner()
    );
  }, [library, chainId]);

  const listNFT = async (collectionAddress, tokenId, price) => {
    if (!contract || !account) throw new Error('Contract not initialized');

    try {
      const tx = await contract.listNFT(
        collectionAddress,
        tokenId,
        ethers.utils.parseEther(price.toString())
      );
      const receipt = await tx.wait();
      
      // Get listingId from event
      const event = receipt.events?.find(e => e.event === 'NFTListed');
      return event?.args?.listingId;
    } catch (error) {
      console.error('List NFT error:', error);
      throw error;
    }
  };

  const cancelListing = async (listingId) => {
    if (!contract || !account) throw new Error('Contract not initialized');

    try {
      const tx = await contract.cancelListing(listingId);
      await tx.wait();
    } catch (error) {
      console.error('Cancel listing error:', error);
      throw error;
    }
  };


  const buyNFT = async (listingId, price) => {
    if (!contract || !account) throw new Error('Contract not initialized');

    try {
      const tx = await contract.buyNFT(listingId, {
        value: ethers.utils.parseEther(price.toString())
      });
      await tx.wait();
    } catch (error) {
      console.error('Buy NFT error:', error);
      throw error;
    }
  };

  const updatePrice = async (listingId, newPrice) => {
    if (!contract || !account) throw new Error('Contract not initialized');

    try {
      const tx = await contract.updatePrice(
        listingId,
        ethers.utils.parseEther(newPrice.toString())
      );
      await tx.wait();
    } catch (error) {
      console.error('Update price error:', error);
      throw error;
    }
  };

  const getListing = async (listingId) => {
    if (!contract || !account) throw new Error('Contract not initialized');

    try {
      const listing = await contract.getListing(listingId);
      return listing;
    } catch (error) {
      console.error('Get listing error:', error);
      throw error;
    }
  };

  // Function to get all listings for a specific collection
  const getListingsByCollection = async (collectionAddress) => {
    if (!contract || !account) throw new Error('Contract not initialized');

    try {
      const listings = await contract.getListingsByCollection(collectionAddress);
      return listings;
    } catch (error) {
      console.error('Get collection listings error:', error);
      throw error;
    }
  };

  // Function to get total number of listings for a collection
  const getCollectionListingsCount = async (collectionAddress) => {
    if (!contract || !account) throw new Error('Contract not initialized');

    try {
      const count = await contract.getCollectionListingsCount(collectionAddress);
      return count;
    } catch (error) {
      console.error('Get collection listings count error:', error);
      throw error;
    }
  };

  // Hàm mới để lấy tất cả các listing đang hoạt động
  const getAllActiveListings = async () => {
    if (!contract || !library) throw new Error('Contract not initialized');

    try {
      console.log('Fetching active listings from blockchain...');
      
      // Lấy filter cho sự kiện NFTListed
      const listedFilter = contract.filters.NFTListed();
      const canceledFilter = contract.filters.ListingCanceled();
      
      // Kiểm tra xem sự kiện NFTSold có tồn tại trong ABI không
      let soldFilter = null;
      try {
        soldFilter = contract.filters.NFTSold();
      } catch (error) {
        console.warn('NFTSold event not found in ABI, will only check for canceled listings');
      }
      
      // Lấy block hiện tại
      const currentBlock = await library.getBlockNumber();
      // Lấy sự kiện từ 10000 block trước đó (có thể điều chỉnh số block)
      const fromBlock = Math.max(0, currentBlock - 10000);
      
      // Lấy tất cả các sự kiện
      let listedEvents, canceledEvents, soldEvents = [];
      
      try {
        if (soldFilter) {
          // Nếu có sự kiện NFTSold, lấy tất cả các sự kiện cùng lúc
          [listedEvents, canceledEvents, soldEvents] = await Promise.all([
            contract.queryFilter(listedFilter, fromBlock),
            contract.queryFilter(canceledFilter, fromBlock),
            contract.queryFilter(soldFilter, fromBlock)
          ]);
        } else {
          // Nếu không có sự kiện NFTSold, chỉ lấy sự kiện NFTListed và ListingCanceled
          [listedEvents, canceledEvents] = await Promise.all([
            contract.queryFilter(listedFilter, fromBlock),
            contract.queryFilter(canceledFilter, fromBlock)
          ]);
          soldEvents = []; // Đảm bảo soldEvents là một mảng rỗng
        }
      } catch (queryError) {
        console.error('Error querying events:', queryError);
        // Nếu không thể query events, trả về mảng rỗng
        return [];
      }
      
      console.log(`Found ${listedEvents.length} listed events, ${canceledEvents.length} canceled events, ${soldEvents.length || 0} sold events`);
      
      // Tạo map để theo dõi các listing đã bị hủy hoặc đã bán
      const inactiveListingIds = new Set();
      
      // Thêm các listing đã bị hủy vào set
      for (const event of canceledEvents) {
        try {
          const listingId = event.args.listingId.toString();
          inactiveListingIds.add(listingId);
        } catch (error) {
          console.warn('Error processing canceled event:', error);
        }
      }
      
      // Thêm các listing đã bán vào set (nếu có sự kiện NFTSold)
      for (const event of soldEvents) {
        try {
          if (event.args && event.args.listingId) {
            const listingId = event.args.listingId.toString();
            inactiveListingIds.add(listingId);
          }
        } catch (error) {
          console.warn('Error processing sold event:', error);
        }
      }
      
      // Lọc ra các listing đang hoạt động và lấy thông tin chi tiết
      const activeListings = [];
      const processedListings = new Set(); // Để tránh xử lý trùng lặp
      
      // Giới hạn số lượng listing để xử lý (tránh quá tải)
      const MAX_LISTINGS_TO_PROCESS = 20;
      let processedCount = 0;
      
      for (const event of listedEvents) {
        try {
          // Kiểm tra giới hạn
          if (processedCount >= MAX_LISTINGS_TO_PROCESS) {
            console.log(`Reached limit of ${MAX_LISTINGS_TO_PROCESS} listings, stopping processing`);
            break;
          }
          
          const listingId = event.args.listingId.toString();
          
          // Bỏ qua nếu listing đã bị hủy hoặc đã bán hoặc đã xử lý
          if (inactiveListingIds.has(listingId) || processedListings.has(listingId)) {
            continue;
          }
          
          processedListings.add(listingId);
          processedCount++;
          
          // Lấy thông tin chi tiết của listing
          let listing;
          try {
            listing = await getListing(listingId);
            // Nếu listing không tồn tại hoặc không hoạt động, bỏ qua
            if (!listing || !listing.isActive) {
              continue;
            }
          } catch (listingError) {
            console.warn(`Error fetching listing ${listingId}:`, listingError);
            continue; // Bỏ qua listing này và tiếp tục với listing tiếp theo
          }
          
          try {
            // Lấy metadata của NFT
            const nftContract = new ethers.Contract(
              listing.collection,
              [
                "function tokenURI(uint256 tokenId) view returns (string)",
                "function name() view returns (string)",
                "function symbol() view returns (string)"
              ],
              library
            );
            
            // Lấy tokenURI và tên collection
            let tokenURI, collectionName;
            try {
              [tokenURI, collectionName] = await Promise.all([
                nftContract.tokenURI(listing.tokenId),
                nftContract.name()
              ]);
            } catch (contractError) {
              console.warn(`Error calling NFT contract methods for listing ${listingId}:`, contractError);
              // Sử dụng giá trị mặc định
              tokenURI = '';
              collectionName = 'Unknown Collection';
            }
            
            
            // Chuẩn hóa tokenURI
            const normalizedTokenURI = normalizeIPFSUrl(tokenURI);
            
            // Fetch metadata từ tokenURI với cơ chế fallback và timeout
            let metadata;
            try {
              // Thêm timeout để tránh chờ quá lâu
              const controller = new AbortController();
              const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 giây timeout
              
              const response = await fetch(normalizedTokenURI, { 
                signal: controller.signal 
              });
              clearTimeout(timeoutId);
              
              if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
              }
              
              metadata = await response.json();
            } catch (fetchError) {
              console.warn(`Failed to fetch metadata from ${normalizedTokenURI}:`, fetchError);
              
              // Thử với gateway IPFS khác nếu là URL IPFS
              if (normalizedTokenURI.includes('ipfs.io/ipfs/')) {
                try {
                  // Đảm bảo không lặp lại gateway
                  const ipfsHash = normalizedTokenURI.replace('https://ipfs.io/ipfs/', '');
                  const alternativeURL = `https://gateway.pinata.cloud/ipfs/${ipfsHash}`;
                  console.log('Trying alternative IPFS gateway:', alternativeURL);
                  
                  const controller = new AbortController();
                  const timeoutId = setTimeout(() => controller.abort(), 5000);
                  
                  const response = await fetch(alternativeURL, { 
                    signal: controller.signal 
                  });
                  clearTimeout(timeoutId);
                  
                  if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                  }
                  
                  metadata = await response.json();
                } catch (alternativeFetchError) {
                  console.warn('Alternative IPFS gateway also failed:', alternativeFetchError);
                  // Sử dụng metadata mặc định
                  metadata = {
                    name: `NFT #${listing.tokenId}`,
                    description: 'Metadata unavailable',
                    image: null
                  };
                }
              } else if (normalizedTokenURI.includes('gateway.pinata.cloud/ipfs/')) {
                try {
                  // Thử với gateway IPFS.io nếu Pinata thất bại
                  const ipfsHash = normalizedTokenURI.replace('https://gateway.pinata.cloud/ipfs/', '');
                  const alternativeURL = `https://ipfs.io/ipfs/${ipfsHash}`;
                  console.log('Trying alternative IPFS gateway (ipfs.io):', alternativeURL);
                  
                  const controller = new AbortController();
                  const timeoutId = setTimeout(() => controller.abort(), 5000);
                  
                  const response = await fetch(alternativeURL, { 
                    signal: controller.signal 
                  });
                  clearTimeout(timeoutId);
                  
                  if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                  }
                  
                  metadata = await response.json();
                } catch (alternativeFetchError) {
                  console.warn('Alternative IPFS gateway also failed:', alternativeFetchError);
                  // Sử dụng metadata mặc định
                  metadata = {
                    name: `NFT #${listing.tokenId}`,
                    description: 'Metadata unavailable',
                    image: null
                  };
                }
              } else {
                // Sử dụng metadata mặc định nếu không phải URL IPFS
                metadata = {
                  name: `NFT #${listing.tokenId}`,
                  description: 'Metadata unavailable',
                  image: null
                };
              }
            }
            
            // Chuẩn hóa image URL với cơ chế fallback
            let imageUrl = 'https://images.unsplash.com/photo-1634973357973-f2ed2657db3c?w=400&h=400&fit=crop';
            
            if (metadata.image) {
              // Chuẩn hóa IPFS URL cho hình ảnh
              imageUrl = normalizeTokenURI(metadata.image);
            }
            
            // Thêm vào danh sách kết quả
            activeListings.push({
              id: listingId,
              name: metadata.name || `NFT #${listing.tokenId}`,
              description: metadata.description || '',
              image: imageUrl,
              collection: collectionName,
              tokenId: listing.tokenId,
              price: ethers.utils.formatEther(listing.price),
              seller: listing.seller,
              collectionAddress: listing.collection,
              attributes: metadata.attributes || [],
              likes: Math.floor(Math.random() * 100) // Giả lập số lượt thích
            });
          } catch (metadataError) {
            console.error(`Error processing metadata for listing ${listingId}:`, metadataError);
            
            // Vẫn thêm vào danh sách nhưng với thông tin tối thiểu
            activeListings.push({
              id: listingId,
              name: `NFT #${listing.tokenId}`,
              description: 'Metadata unavailable',
              image: 'https://via.placeholder.com/500?text=Metadata+Unavailable',
              collection: 'Unknown Collection',
              tokenId: listing.tokenId,
              price: ethers.utils.formatEther(listing.price),
              seller: listing.seller,
              collectionAddress: listing.collection,
              likes: Math.floor(Math.random() * 100) // Giả lập số lượt thích
            });
          }
        } catch (eventError) {
          console.error(`Error processing event:`, eventError);
          // Tiếp tục với event tiếp theo
          continue;
        }
      }
      
      console.log(`Found ${activeListings.length} active listings`);
      return activeListings;
    } catch (error) {
      console.error('Get all active listings error:', error);
      return []; // Trả về mảng rỗng thay vì throw error
    }
  };

  return {
    contract,
    listNFT,
    cancelListing,
    buyNFT,
    updatePrice,
    getListing,
    getListingsByCollection,
    getCollectionListingsCount,
    getAllActiveListings
  };
}; 