import { useWeb3 } from '../../hooks/useWeb3';
import { formatAddress } from '../../utils/algorithm';
import { useNavigate } from 'react-router-dom';
import { useCollections } from '../../hooks/useCollections';

const CollectionNFTs = ({ collectionAddress }) => {
  const { active } = useWeb3();
  const navigate = useNavigate();
  const {
    collection,
    metadata,
    nfts,
    loading,
    error,
    contractStatus,
    handleRefresh
  } = useCollections(collectionAddress);

  const handleNFTClick = (tokenId) => {
    navigate(`/nft/${collectionAddress}/${tokenId}`);
  };

  if (!active) {
    return (
      <div className="glass-panel p-12 text-center rounded-2xl backdrop-blur-md border border-white/10 shadow-xl">
        <div className="w-20 h-20 bg-gradient-to-br from-neon-purple to-neon-pink rounded-full mx-auto flex items-center justify-center mb-6 shadow-lg">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-white" viewBox="0 0 20 20" fill="currentColor">
            <path d="M13 7H7v6h6V7z" />
            <path fillRule="evenodd" d="M7 2a1 1 0 012 0v1h2V2a1 1 0 112 0v1h2a2 2 0 012 2v2h1a1 1 0 110 2h-1v2h1a1 1 0 110 2h-1v2a2 2 0 01-2 2h-2v1a1 1 0 11-2 0v-1H9v1a1 1 0 11-2 0v-1H5a2 2 0 01-2-2v-2H2a1 1 0 110-2h1V9H2a1 1 0 010-2h1V5a2 2 0 012-2h2V2zM5 5h10v10H5V5z" clipRule="evenodd" />
          </svg>
        </div>
        <h3 className="text-2xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-neon-purple to-neon-pink">Connect Your Wallet</h3>
        <p className="text-gray-400 max-w-md mx-auto">Please connect your wallet to view NFTs in this collection</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header with collection info */}
      {collection && (
        <div className="relative overflow-hidden rounded-2xl bg-dark-200/30 backdrop-blur-md border border-white/5 shadow-xl">
          <div className="absolute inset-0 bg-gradient-to-r from-neon-purple/10 to-neon-pink/10 opacity-50"></div>
          <div className="absolute -inset-0.5 bg-gradient-to-r from-neon-purple/30 to-neon-pink/30 blur-xl opacity-20"></div>
          
          <div className="relative p-8">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-neon-purple to-neon-pink flex items-center justify-center shadow-lg">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M7 3a1 1 0 000 2h6a1 1 0 100-2H7zM4 7a1 1 0 011-1h10a1 1 0 110 2H5a1 1 0 01-1-1zM2 11a2 2 0 012-2h12a2 2 0 012 2v4a2 2 0 01-2 2H4a2 2 0 01-2-2v-4z" />
                    </svg>
                  </div>
                  <h2 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-neon-purple to-neon-pink">
                    {collection.name}
                  </h2>
                </div>
                <p className="text-gray-400 text-lg">
                  {collection.symbol} • {collection.totalSupply} NFTs
                </p>
                {metadata?.description && (
                  <p className="text-gray-400 mt-2 max-w-2xl">{metadata.description}</p>
                )}
              </div>
              
              <div className="flex gap-3">
                <button 
                  onClick={handleRefresh}
                  className="px-4 py-2.5 bg-gradient-to-r from-neon-purple/20 to-neon-pink/20 hover:from-neon-purple/30 hover:to-neon-pink/30 rounded-lg transition-all duration-300 flex items-center gap-2 border border-white/10 shadow-md hover:shadow-lg"
                  disabled={loading}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className={`h-5 w-5 ${loading ? 'animate-spin' : ''}`} viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
                  </svg>
                  {loading ? 'Loading...' : 'Refresh'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Status panel */}
      <div className="glass-panel p-6 rounded-xl backdrop-blur-md border border-white/5 shadow-lg">
        <div className="flex items-center gap-3">
          <div className={`w-3 h-3 rounded-full ${error ? 'bg-red-500' : loading ? 'bg-yellow-500 animate-pulse' : 'bg-green-500'}`}></div>
          <h3 className="text-lg font-semibold">NFT Status</h3>
        </div>
        
        <p className={`mt-2 ${error ? 'text-red-400' : 'text-gray-300'}`}>
          {error ? error : loading ? contractStatus : `Found ${nfts.length} NFTs in this collection`}
        </p>
        
        {loading && (
          <div className="mt-4 animate-pulse space-y-3">
            <div className="h-3 bg-glass-white/10 rounded-full w-1/2" />
            <div className="h-3 bg-glass-white/10 rounded-full w-1/3" />
            <div className="h-3 bg-glass-white/10 rounded-full w-2/3" />
          </div>
        )}
      </div>
      
      {/* NFTs grid */}
      {!loading && nfts.length > 0 ? (
        <div>
          {/* Filter and sort controls */}
          <div className="flex flex-wrap justify-between items-center mb-6 gap-4">
            <h3 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-neon-purple to-neon-pink">
              Collection NFTs
            </h3>
            <div className="flex flex-wrap gap-3">
              <select className="bg-dark-300/50 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-neon-purple/50">
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
                <option value="name-asc">Name (A-Z)</option>
                <option value="name-desc">Name (Z-A)</option>
              </select>
              <div className="relative">
                <input 
                  type="text" 
                  placeholder="Search NFTs..." 
                  className="bg-dark-300/50 border border-white/10 rounded-lg pl-10 pr-4 py-2 text-sm text-white w-full focus:outline-none focus:ring-2 focus:ring-neon-purple/50"
                />
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                </svg>
              </div>
            </div>
          </div>
          
          {/* NFT Grid with improved layout */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {nfts.map((nft) => (
              <div 
                key={nft.id} 
                className="group relative overflow-hidden rounded-xl bg-dark-200/30 backdrop-blur-md border border-white/5 shadow-lg transition-all duration-300 hover:shadow-xl hover:border-neon-purple/20 hover:translate-y-[-5px] cursor-pointer w-full h-[600px]"
                onClick={() => handleNFTClick(nft.id)}
              >
                {/* NFT Image with overlay */}
                <div className="relative h-[300px] overflow-hidden">
                  <img
                    src={nft.image}
                    alt={nft.name}
                    className="w-full h-full object-cover transition-all duration-500 group-hover:scale-110"
                    loading="lazy"
                    onError={(e) => {
                      e.target.src = 'https://images.unsplash.com/photo-1634973357973-f2ed2657db3c?w=400&h=400&fit=crop';
                    }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-dark-100/90 via-dark-100/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  
                  {/* Hover actions */}
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300">
                    <button 
                      className="px-4 py-2 bg-neon-purple text-white rounded-lg transform -translate-y-4 group-hover:translate-y-0 transition-transform duration-300 shadow-lg hover:shadow-neon-purple/50"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleNFTClick(nft.id);
                      }}
                    >
                      View Details
                    </button>
                  </div>
                  
                  {/* NFT ID Badge */}
                  <div className="absolute top-3 left-3 bg-dark-100/80 backdrop-blur-sm px-2 py-1 rounded-md text-xs font-medium border border-white/10">
                    #{nft.id}
                  </div>
                </div>
                
                {/* NFT Content */}
                <div className="p-5 h-[300px] flex flex-col">
                  <h3 className="font-bold text-lg mb-2 truncate">{nft.name}</h3>
                  
                  {/* Description with truncate */}
                  <p className="text-gray-400 text-sm mb-4 line-clamp-2 h-10">
                    {nft.description || "No description available"}
                  </p>
                  
                  {/* Owner/Creator info in grid */}
                  <div className="grid grid-cols-2 gap-4">
                    {/* Creator info */}
                    <div className="glass-panel p-3 rounded-xl backdrop-blur-sm hover:bg-white/5 transition-colors flex flex-col items-center text-center">
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-neon-purple to-neon-pink p-0.5 shadow-lg shadow-neon-purple/20 mb-2">
                        <div className="w-full h-full rounded-xl bg-dark-200 flex items-center justify-center">
                          <span className="text-base font-bold">C</span>
                        </div>
                      </div>
                      <span className="text-xs text-gray-400 mb-1">Creator</span>
                      <span className="text-sm text-gray-300 truncate w-full" title={nft.creator}>
                        {formatAddress(nft.creator)}
                      </span>
                    </div>
                    
                    {/* Owner info */}
                    <div className="glass-panel p-3 rounded-xl backdrop-blur-sm hover:bg-white/5 transition-colors flex flex-col items-center text-center">
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-blue-400 to-blue-600 p-0.5 shadow-lg shadow-neon-blue/20 mb-2">
                        <div className="w-full h-full rounded-xl bg-dark-200 flex items-center justify-center">
                          <span className="text-base font-bold">O</span>
                        </div>
                      </div>
                      <span className="text-xs text-gray-400 mb-1">Owner</span>
                      <span className="text-sm text-gray-300 truncate w-full" title={nft.owner}>
                        {formatAddress(nft.owner)}
                      </span>
                    </div>
                  </div>
                  
                  {/* Attributes preview */}
                  {nft.attributes && nft.attributes.length > 0 && (
                    <div className="mt-4 pt-4 border-t border-white/5">
                      <p className="text-xs text-gray-400 mb-2">Attributes:</p>
                      <div className="flex flex-wrap gap-2">
                        {nft.attributes.slice(0, 3).map((attr, idx) => (
                          <div key={idx} className="px-2 py-1 bg-dark-300/50 rounded-md text-xs border border-white/5">
                            <span className="text-gray-400">{attr.trait_type}:</span> {attr.value}
                          </div>
                        ))}
                        {nft.attributes.length > 3 && (
                          <div className="px-2 py-1 bg-dark-300/50 rounded-md text-xs border border-white/5">
                            +{nft.attributes.length - 3} more
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : !loading && !error && (
        <div className="text-center py-12 glass-panel rounded-xl backdrop-blur-md border border-white/5 shadow-lg">
          <div className="w-24 h-24 mx-auto mb-6 text-gray-400">
            <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
          <h3 className="text-xl font-semibold mb-2">No NFTs Found</h3>
          <p className="text-gray-400 mb-6">This collection doesn't have any NFTs yet</p>
          <button 
            onClick={handleRefresh}
            className="px-6 py-3 bg-gradient-to-r from-neon-purple to-neon-pink rounded-lg transition-all duration-300 flex items-center gap-2 mx-auto hover:shadow-lg hover:shadow-neon-purple/20"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
            </svg>
            Try Again
          </button>
        </div>
      )}
    </div>
  );
};

export default CollectionNFTs;