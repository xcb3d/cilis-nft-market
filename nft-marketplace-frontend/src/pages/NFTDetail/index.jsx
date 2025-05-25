import { useState, useEffect, useRef, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useWeb3 } from '../../hooks/useWeb3';
import { ethers } from 'ethers';
import { useNFTCollection } from '../../contracts/hooks/useNFTCollection';
import { useMarketplace } from '../../contracts/hooks/useMarketplace';
import { useNFTTransactionHistory } from '../../hooks/useNFTTransactionHistory';
import { useNFTOperations } from '../../hooks/useNFTOperations';
import { normalizeIPFSUrl } from '../../utils/algorithm';
import NFTImage from './components/NFTImage';
import NFTProperties from './components/NFTProperties';
import NFTInfo from './components/NFTInfo';
import NFTActions from './components/NFTActions';
import TransactionHistory from './components/TransactionHistory';
import ListingModal from './components/ListingModal';
import LoadingState from './components/LoadingState';
import ErrorState from './components/ErrorState';
import { ERC721_ABI } from './constants';

const NFTDetail = () => {
  const { collectionAddress, tokenId } = useParams();
  const navigate = useNavigate();
  const { library, account, active } = useWeb3();
  const [nft, setNft] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [listingPrice, setListingPrice] = useState('');
  const [currentListing, setCurrentListing] = useState(null);
  const [showListingModal, setShowListingModal] = useState(false);
  
  const priceInputRef = useRef(null);
  const nftCollection = useNFTCollection(collectionAddress);
  const marketplace = useMarketplace();
  
  const {
    transactionHistory,
    loadingHistory,
    transactionHistoryError,
    fetchTransactionHistory
  } = useNFTTransactionHistory(library, marketplace, collectionAddress, tokenId);

  const {
    isListing,
    isApproving,
    isCancelling,
    isBuying,
    listNFT,
    cancelListing,
    buyNFT
  } = useNFTOperations(marketplace, nftCollection, account);

  const checkIfNFTIsListed = async () => {
    if (!marketplace.contract || !collectionAddress || !tokenId) return;
    
    try {
      const listings = transactionHistory.filter(tx => tx.type === 'listed');
      const cancellations = transactionHistory.filter(tx => tx.type === 'cancelled');
      const sales = transactionHistory.filter(tx => tx.type === 'sold');
      
      if (listings.length > 0) {
        const latestListing = listings.reduce((latest, current) => 
          current.blockNumber > latest.blockNumber ? current : latest
        );
        
        const wasCancelled = cancellations.some(tx => 
          tx.listingId === latestListing.listingId && tx.blockNumber > latestListing.blockNumber
        );
        
        const wasSold = sales.some(tx => 
          tx.listingId === latestListing.listingId && tx.blockNumber > latestListing.blockNumber
        );
        
        if (!wasCancelled && !wasSold) {
          const listingInfo = await marketplace.getListing(latestListing.listingId);
          
          if (listingInfo && listingInfo.isActive) {
            setCurrentListing({
              id: latestListing.listingId,
              collection: collectionAddress,
              tokenId,
              seller: listingInfo.seller,
              price: ethers.utils.formatEther(listingInfo.price),
              isActive: true
            });
            return;
          }
        }
      }
      
      setCurrentListing(null);
    } catch {
      setCurrentListing(null);
    }
  };

  useEffect(() => {
    if (!active || !library || !collectionAddress || !tokenId) {
      setLoading(false);
      return;
    }

    const fetchNFTDetails = async () => {
      try {
        if (!ethers.utils.isAddress(collectionAddress)) {
          throw new Error(`Invalid collection address: ${collectionAddress}`);
        }
        
        const contract = new ethers.Contract(collectionAddress, ERC721_ABI, library.getSigner());
        const [tokenURI, owner, transferEvents] = await Promise.all([
          contract.tokenURI(tokenId),
          contract.ownerOf(tokenId),
          contract.queryFilter(contract.filters.Transfer(null, null, tokenId))
        ]);

        const normalizedTokenURI = normalizeIPFSUrl(tokenURI);
        const response = await fetch(normalizedTokenURI);
        const metadata = await response.json();
        const normalizedImageUrl = metadata.image ? normalizeIPFSUrl(metadata.image) : null;

        let creator;
        try {
          creator = await contract.getCreator(tokenId);
        } catch {
          creator = metadata.creator || owner;
        }

        const mintEvent = transferEvents.find(event => {
          const fromAddress = '0x' + event.topics[1].slice(26);
          return fromAddress === '0x0000000000000000000000000000000000000000';
        });

        let mintTimestamp;
        if (mintEvent) {
          const block = await library.getBlock(mintEvent.blockNumber);
          mintTimestamp = block.timestamp * 1000;
        }

        setNft({
          id: tokenId,
          name: metadata.name || `NFT #${tokenId}`,
          description: metadata.description || '',
          image: normalizedImageUrl || 'https://images.unsplash.com/photo-1634973357973-f2ed2657db3c?w=400&h=400&fit=crop',
          attributes: metadata.attributes || [],
          owner,
          creator,
          tokenURI: normalizedTokenURI,
          mintTimestamp
        });

      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchNFTDetails();
  }, [active, library, collectionAddress, tokenId]);

  useEffect(() => {
    if (transactionHistory.length > 0 && !transactionHistoryError) {
      checkIfNFTIsListed();
    } else if (transactionHistoryError) {
      setCurrentListing(null);
    }
  }, [transactionHistory, transactionHistoryError]);

  const handleListNFT = async () => {
    if (!nft) {
      alert('NFT data not available. Please try again later.');
      return;
    }
    
    if (currentListing) {
      alert('This NFT is already listed for sale.');
      closeListingModal();
      return;
    }
    
    try {
      const listing = await listNFT(collectionAddress, tokenId, listingPrice, (newListing) => {
        setCurrentListing(newListing);
        fetchTransactionHistory();
      });
      
      closeListingModal();
      setListingPrice('');
    } catch (error) {
      alert(`Failed to list NFT: ${error.message}`);
    }
  };

  const handleCancelListing = async () => {
    if (!currentListing) return;
    
    try {
      await cancelListing(currentListing.id, () => {
        setCurrentListing(null);
        fetchTransactionHistory();
      });
    } catch (error) {
      alert(`Failed to cancel listing: ${error.message}`);
    }
  };

  const handlePriceChange = (e) => {
    setListingPrice(e.target.value);
  };

  const openListingModal = () => {
    if (currentListing) {
      alert('This NFT is already listed for sale.');
      return;
    }
    
    setListingPrice('');
    setShowListingModal(true);
    setTimeout(() => {
      if (priceInputRef.current) {
        priceInputRef.current.focus();
      }
    }, 100);
  };

  const closeListingModal = () => {
    setShowListingModal(false);
  };

  const handleBuyNFT = async () => {
    if (!currentListing) {
      alert('This NFT is not currently listed for sale.');
      return;
    }
    
    try {
      await buyNFT(currentListing.id, currentListing.price, () => {
        setCurrentListing(null);
        setNft(prevNft => ({...prevNft, owner: account}));
        fetchTransactionHistory();
      });
    } catch (error) {
      alert(`Failed to buy NFT: ${error.message}`);
    }
  };

  if (loading) return <LoadingState />;
  if (error) return <ErrorState error={error} onBack={() => navigate(-1)} />;
  if (!nft) return null;

  const isOwner = account && nft?.owner.toLowerCase() === account.toLowerCase();

  return (
    <div className="min-h-screen py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <button 
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-gray-400 hover:text-white mb-8 transition-colors"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
          </svg>
          <span>Back</span>
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          <div>
            <NFTImage 
              nft={nft}
              currentListing={currentListing}
            />
            <NFTProperties attributes={nft.attributes} />
          </div>

          <div className="space-y-6">
            <div className="space-y-6">
              <NFTInfo nft={nft} />
              <NFTActions 
                isOwner={isOwner}
                currentListing={currentListing}
                isCancelling={isCancelling}
                isBuying={isBuying}
                handleCancelListing={handleCancelListing}
                handleBuyNFT={handleBuyNFT}
                openListingModal={openListingModal}
              />
            </div>

            <div className="glass-panel p-6 rounded-2xl">
              <h3 className="text-lg font-bold mb-4">Transaction History</h3>
              <TransactionHistory 
                loadingHistory={loadingHistory}
                transactionHistoryError={transactionHistoryError}
                transactionHistory={transactionHistory}
                fetchTransactionHistory={fetchTransactionHistory}
              />
            </div>
          </div>
        </div>
      </div>

      <ListingModal 
        showListingModal={showListingModal}
        closeListingModal={closeListingModal}
        listingPrice={listingPrice}
        handlePriceChange={handlePriceChange}
        handleListNFT={handleListNFT}
        isListing={isListing}
        isApproving={isApproving}
        priceInputRef={priceInputRef}
      />
    </div>
  );
};

export default NFTDetail;