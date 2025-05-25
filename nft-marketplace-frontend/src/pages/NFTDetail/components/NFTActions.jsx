import React from 'react';
import Button from '../../../components/common/Button';

const NFTActions = ({ 
  isOwner,
  currentListing,
  isCancelling,
  isBuying,
  handleCancelListing,
  handleBuyNFT,
  openListingModal 
}) => {
  return (
    <div className="flex gap-4">
      {isOwner ? (
        currentListing ? (
          <Button 
            variant="danger" 
            className="flex-1"
            onClick={handleCancelListing}
            disabled={isCancelling}
          >
            {isCancelling ? 'Cancelling...' : 'Cancel Listing'}
          </Button>
        ) : (
          <Button 
            variant="primary" 
            className="flex-1"
            onClick={openListingModal}
          >
            List for Sale
          </Button>
        )
      ) : (
        currentListing ? (
          <Button 
            variant="primary" 
            className="flex-1"
            onClick={handleBuyNFT}
            disabled={isBuying}
          >
            {isBuying ? 'Processing...' : `Buy Now (${currentListing.price} ETH)`}
          </Button>
        ) : (
          <Button variant="primary" className="flex-1" disabled>
            Not for Sale
          </Button>
        )
      )}
      <Button variant="glass">
        Share
      </Button>
    </div>
  );
};

export default NFTActions; 