import { useState } from 'react';
import { useWeb3 } from '../../hooks/useWeb3';
import { useCollections } from '../../hooks/useCollections';
import CollectionDetails from './CollectionDetails';
import CollectionCard from './CollectionCard';
import StatusPanel from './StatusPanel';

const UserCollections = () => {
  const { account, active } = useWeb3();
  const { 
    collections, 
    loading, 
    error, 
    contractStatus, 
    handleRefresh 
  } = useCollections();
  
  const [showDetails, setShowDetails] = useState(true);
  const [selectedAddress, setSelectedAddress] = useState(null);
  
  // Toggle between simple and detailed view
  const toggleDetails = () => {
    setShowDetails(prev => !prev);
  };

  // Toggle details for a specific collection
  const toggleCollectionDetails = (address) => {
    if (selectedAddress === address) {
      setSelectedAddress(null);
    } else {
      setSelectedAddress(address);
      setShowDetails(true);
    }
  };
  
  // If wallet not connected
  if (!active) {
    return (
      <div className="glass-panel p-12 text-center rounded-2xl backdrop-blur-md border border-cyan-500/10 shadow-xl">
        <div className="w-20 h-20 bg-gradient-to-br from-cyan-500 to-blue-400 rounded-full mx-auto flex items-center justify-center mb-6 shadow-lg">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-white" viewBox="0 0 20 20" fill="currentColor">
            <path d="M13 7H7v6h6V7z" />
            <path fillRule="evenodd" d="M7 2a1 1 0 012 0v1h2V2a1 1 0 112 0v1h2a2 2 0 012 2v2h1a1 1 0 110 2h-1v2h1a1 1 0 110 2h-1v2a2 2 0 01-2 2h-2v1a1 1 0 11-2 0v-1H9v1a1 1 0 11-2 0v-1H5a2 2 0 01-2-2v-2H2a1 1 0 110-2h1V9H2a1 1 0 010-2h1V5a2 2 0 012-2h2V2zM5 5h10v10H5V5z" clipRule="evenodd" />
          </svg>
        </div>
        <h3 className="text-2xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-blue-500">Connect Your Wallet</h3>
        <p className="text-gray-400 max-w-md mx-auto">Please connect your wallet to view and manage your NFT collections</p>
      </div>
    );
  }
  
  return (
    <div className="space-y-8">
      {/* Header with animated background */}
      <div className="relative overflow-hidden rounded-2xl bg-dark-200/30 backdrop-blur-md border border-cyan-500/10 shadow-xl">
        <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/10 to-blue-400/10 opacity-50"></div>
        <div className="absolute -inset-0.5 bg-gradient-to-r from-cyan-500/30 to-blue-400/30 blur-xl opacity-20"></div>
        
        <div className="relative p-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-400 flex items-center justify-center shadow-lg">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M7 3a1 1 0 000 2h6a1 1 0 100-2H7zM4 7a1 1 0 011-1h10a1 1 0 110 2H5a1 1 0 01-1-1zM2 11a2 2 0 012-2h12a2 2 0 012 2v4a2 2 0 01-2 2H4a2 2 0 01-2-2v-4z" />
                  </svg>
                </div>
                <h2 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-blue-500">
                  Your Collections
                </h2>
              </div>
              <p className="text-gray-300 text-lg">
                Manage and view your created NFT collections
              </p>
            </div>
            
            <div className="flex gap-3">
              <button 
                onClick={toggleDetails}
                className="px-4 py-2.5 bg-dark-200/70 hover:bg-dark-200/90 rounded-lg transition-all duration-300 flex items-center gap-2 border border-cyan-500/10 shadow-md hover:shadow-lg hover:border-cyan-500/20"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-cyan-400" viewBox="0 0 20 20" fill="currentColor">
                  {showDetails ? (
                    <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
                  ) : (
                    <path d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM11 13a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                  )}
                </svg>
                <span className="text-gray-300">{showDetails ? 'Simple View' : 'Detailed View'}</span>
              </button>
              <button 
                onClick={handleRefresh}
                className="px-4 py-2.5 bg-gradient-to-r from-cyan-500/20 to-blue-400/20 hover:from-cyan-500/30 hover:to-blue-400/30 rounded-lg transition-all duration-300 flex items-center gap-2 border border-cyan-500/10 shadow-md hover:shadow-lg"
                disabled={loading}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className={`h-5 w-5 text-cyan-400 ${loading ? 'animate-spin' : ''}`} viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 100-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
                </svg>
                <span className="text-gray-300">{loading ? 'Loading...' : 'Refresh'}</span>
              </button>
            </div>
          </div>
        </div>
      </div>
      
      {/* Status panel */}
      <StatusPanel 
        loading={loading}
        error={error}
        contractStatus={contractStatus}
        collections={collections}
      />
      
      {/* Collections list */}
      {!loading && collections.length > 0 && (
        <div className={showDetails ? "grid grid-cols-1 lg:grid-cols-2 gap-8" : "grid grid-cols-1 gap-4"}>
          {collections.map((address) => (
            <div key={address} className={showDetails ? "transform transition-all duration-500" : ""}>
              {showDetails && (selectedAddress === null || selectedAddress === address) ? (
                <CollectionDetails address={address} />
              ) : (
                <CollectionCard 
                  address={address}
                  onToggleDetails={toggleCollectionDetails}
                />
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default UserCollections; 