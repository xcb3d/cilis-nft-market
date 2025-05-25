import NFTCard from '../common/NFTCard';

const NFTGrid = ({ nfts, loading }) => {
  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
        {[...Array(8)].map((_, index) => (
          <div key={index} className="relative overflow-hidden rounded-2xl bg-dark-200/50 backdrop-blur-sm border border-white/5 animate-pulse">
            {/* Skeleton for image */}
            <div className="relative aspect-square overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-purple-600/10 to-blue-500/10" />
              
              {/* Skeleton for collection badge */}
              <div className="absolute top-3 left-3">
                <div className="w-24 h-6 bg-white/5 rounded-lg" />
              </div>
              
              {/* Skeleton for price tag */}
              <div className="absolute top-3 right-3">
                <div className="w-16 h-6 bg-white/5 rounded-lg" />
              </div>
            </div>
            
            {/* Skeleton for content */}
            <div className="p-4">
              {/* Skeleton for title */}
              <div className="h-5 bg-white/5 rounded-md w-3/4 mb-2" />
              
              {/* Skeleton for creator and token ID */}
              <div className="mt-auto pt-3 flex items-center justify-between border-t border-white/5">
                <div className="flex items-center space-x-2">
                  <div className="w-6 h-6 rounded-full bg-white/5" />
                  <div className="w-16 h-3 bg-white/5 rounded-md" />
                </div>
                <div className="w-8 h-3 bg-white/5 rounded-md" />
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (nfts.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 glass-panel rounded-2xl">
        <div className="w-24 h-24 mb-6 rounded-full bg-gradient-to-r from-purple-500 to-blue-500 p-0.5">
          <div className="w-full h-full rounded-full bg-dark-100 flex items-center justify-center">
            <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        </div>
        <h3 className="text-xl font-semibold mb-2">No NFTs Found</h3>
        <p className="text-gray-400 text-center max-w-md">
          We couldn't find any NFTs matching your search criteria. Try adjusting your filters or search term.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
      {nfts.map((nft) => (
        <NFTCard key={nft.id || `${nft.collectionAddress}-${nft.tokenId}`} nft={nft} />
      ))}
    </div>
  );
};

export default NFTGrid; 