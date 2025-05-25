import React from 'react';

const LoadingState = () => {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="glass-panel p-8 rounded-2xl text-center">
        <div className="w-16 h-16 border-4 border-neon-purple border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-gray-400">Loading NFT details...</p>
      </div>
    </div>
  );
};

export default LoadingState; 