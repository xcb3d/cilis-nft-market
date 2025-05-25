const CollectionCard = ({ collection }) => {
  return (
    <div className="card">
      {/* Banner image */}
      <div className="relative h-32 overflow-hidden">
        <img
          src={collection.banner}
          alt={`${collection.name} banner`}
          className="w-full h-full object-cover"
        />
      </div>

      {/* Profile picture */}
      <div className="relative -mt-10 px-4">
        <div className="relative w-20 h-20 rounded-2xl overflow-hidden border-4 border-dark-100 shadow-xl">
          <img
            src={collection.avatar}
            alt={`${collection.name} avatar`}
            className="w-full h-full object-cover"
          />
        </div>
      </div>

      {/* Content */}
      <div className="p-4 pt-2 space-y-2">
        <h3 className="font-semibold text-lg truncate">{collection.name}</h3>
        <div className="flex items-center space-x-2 text-sm text-gray-400">
          <span>by</span>
          <span className="font-medium text-white">{collection.creator}</span>
          {collection.verified && (
            <svg className="w-4 h-4 text-neon-blue" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
          )}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 pt-2">
          <div className="text-center">
            <p className="text-sm text-gray-400">Floor</p>
            <p className="font-semibold">{collection.floor} ETH</p>
          </div>
          <div className="text-center">
            <p className="text-sm text-gray-400">Volume</p>
            <p className="font-semibold">{collection.volume} ETH</p>
          </div>
          <div className="text-center">
            <p className="text-sm text-gray-400">Items</p>
            <p className="font-semibold">{collection.items}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CollectionCard; 