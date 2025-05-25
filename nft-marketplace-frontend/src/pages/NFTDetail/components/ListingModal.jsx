import React from 'react';

const ListingModal = ({
  showListingModal,
  closeListingModal,
  listingPrice,
  handlePriceChange,
  handleListNFT,
  isListing,
  isApproving,
  priceInputRef
}) => {
  if (!showListingModal) return null;

  return (
    <div 
      className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4"
      onClick={closeListingModal}
    >
      <div 
        className="glass-panel p-6 rounded-2xl max-w-md w-full"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-bold">List NFT for Sale</h3>
          <button 
            onClick={closeListingModal}
            className="text-gray-400 hover:text-white"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Price (ETH)
          </label>
          <input
            ref={priceInputRef}
            type="number"
            step="0.01"
            min="0.01"
            value={listingPrice}
            onChange={handlePriceChange}
            placeholder="Enter price in ETH"
            className="w-full px-4 py-3 bg-dark-300 border border-white/10 rounded-xl text-white
              placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-neon-purple/50
              focus:border-neon-purple/50 transition-all"
            autoFocus
          />
        </div>
        
        <div className="flex gap-4">
          <button 
            onClick={handleListNFT}
            disabled={!listingPrice || isListing || isApproving}
            className={`flex-1 px-4 py-3 rounded-xl font-medium transition-all
              ${!listingPrice || isListing || isApproving 
                ? 'bg-gray-700 text-gray-400 cursor-not-allowed' 
                : 'bg-gradient-to-r from-neon-purple to-neon-pink text-white hover:shadow-lg hover:shadow-neon-purple/20'
              }`}
          >
            {isApproving ? 'Approving...' : isListing ? 'Listing...' : 'List NFT'}
          </button>
          
          <button 
            onClick={closeListingModal}
            disabled={isListing || isApproving}
            className="px-4 py-3 rounded-xl font-medium bg-dark-300 border border-white/10
              text-white hover:bg-dark-200 transition-all"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default ListingModal; 