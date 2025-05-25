import React from 'react';
import Button from '../../../components/common/Button';

const ErrorState = ({ error, onBack }) => {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="glass-panel p-8 rounded-2xl text-center max-w-md">
        <div className="w-16 h-16 mx-auto mb-4 text-red-500">
          <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <h3 className="text-xl font-bold mb-2">Error Loading NFT</h3>
        <p className="text-gray-400 mb-4">{error}</p>
        <Button variant="primary" onClick={onBack}>Go Back</Button>
      </div>
    </div>
  );
};

export default ErrorState; 