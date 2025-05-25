import React from 'react';

const NFTProperties = ({ attributes }) => {
  if (!attributes || attributes.length === 0) return null;

  return (
    <div className="glass-panel p-6 rounded-2xl">
      <h3 className="text-lg font-bold mb-4">Properties</h3>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        {attributes.map((attr, idx) => (
          <div 
            key={idx}
            className="glass-panel p-3 rounded-xl text-center hover:bg-white/5 transition-colors"
          >
            <p className="text-xs text-gray-400 mb-1">{attr.trait_type}</p>
            <p className="font-medium truncate">{attr.value}</p>
            {attr.rarity && (
              <p className="text-xs text-gray-400 mt-1">{attr.rarity}% have this trait</p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default NFTProperties; 