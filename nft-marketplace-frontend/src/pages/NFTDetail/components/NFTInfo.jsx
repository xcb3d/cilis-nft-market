import React from 'react';
import { formatAddress } from '../../../utils/algorithm';

const NFTInfo = ({ nft }) => {
  return (
    <div className="glass-panel p-6 rounded-2xl">
      <h1 className="text-3xl font-bold mb-4">{nft.name}</h1>
      <p className="text-gray-400 mb-6">{nft.description}</p>

      <div className="grid grid-cols-2 gap-6 mb-6">
        {/* Creator info */}
        <div className="glass-panel p-4 rounded-xl text-center">
          <div className="w-12 h-12 mx-auto mb-3 rounded-xl bg-gradient-to-r from-neon-purple to-neon-pink p-0.5">
            <div className="w-full h-full rounded-xl bg-dark-200 flex items-center justify-center">
              <span className="text-lg font-bold">C</span>
            </div>
          </div>
          <p className="text-sm text-gray-400 mb-1">Creator</p>
          <p className="font-medium text-sm truncate" title={nft.creator}>
            {nft.creator ? formatAddress(nft.creator) : 'Unknown'}
          </p>
        </div>

        {/* Owner info */}
        <div className="glass-panel p-4 rounded-xl text-center">
          <div className="w-12 h-12 mx-auto mb-3 rounded-xl bg-gradient-to-r from-neon-blue to-neon-green p-0.5">
            <div className="w-full h-full rounded-xl bg-dark-200 flex items-center justify-center">
              <span className="text-lg font-bold">O</span>
            </div>
          </div>
          <p className="text-sm text-gray-400 mb-1">Owner</p>
          <p className="font-medium text-sm truncate" title={nft.owner}>
            {nft.owner ? formatAddress(nft.owner) : 'Unknown'}
          </p>
        </div>
      </div>
    </div>
  );
};

export default NFTInfo; 