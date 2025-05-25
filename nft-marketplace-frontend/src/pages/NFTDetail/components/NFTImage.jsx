import React from 'react';

const NFTImage = ({ nft, currentListing, handleImageError }) => {
  return (
    <div className="space-y-6">
      <div className="glass-panel p-4 rounded-2xl overflow-hidden">
        <div className="relative aspect-square rounded-xl overflow-hidden">
          <img 
            src={nft.image} 
            alt={nft.name}
            className="w-full h-full object-cover"
            onError={handleImageError}
          />
          
          {/* Price tag if listed */}
          {currentListing && (
            <div className="absolute top-4 right-4 bg-gradient-to-r from-neon-purple to-neon-pink px-4 py-2 rounded-lg shadow-lg">
              <p className="text-white font-bold">{currentListing.price} ETH</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default NFTImage; 