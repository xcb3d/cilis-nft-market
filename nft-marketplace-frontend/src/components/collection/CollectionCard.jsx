import { useCollectionImage } from '../../hooks/useCollectionImage';

const CollectionCard = ({ collection }) => {
  const { image: logo, loading: logoLoading } = useCollectionImage(collection.logo, 'logo');
  const { image: banner, loading: bannerLoading } = useCollectionImage(collection.banner, 'banner');

  if (logoLoading || bannerLoading) {
    return (
      <div className="p-4 bg-dark-200/30 rounded-lg animate-pulse">
        <div className="h-32 bg-dark-300/50 rounded-lg mb-4"></div>
        <div className="h-12 w-12 bg-dark-300/50 rounded-full mb-2"></div>
        <div className="h-4 bg-dark-300/50 rounded w-1/2"></div>
      </div>
    );
  }

  return (
    <div className="p-4 bg-dark-200/30 rounded-lg">
      {/* Banner Image */}
      <div className="relative h-32 rounded-lg overflow-hidden mb-4">
        <img 
          src={banner} 
          alt={`${collection.name} banner`}
          className="w-full h-full object-cover"
        />
      </div>
      
      {/* Logo */}
      <div className="flex items-center gap-4">
        <img 
          src={logo} 
          alt={`${collection.name} logo`}
          className="w-12 h-12 rounded-full object-cover"
        />
        <div>
          <h3 className="font-semibold">{collection.name}</h3>
          <p className="text-sm text-gray-400">{collection.symbol}</p>
        </div>
      </div>
    </div>
  );
};

export default CollectionCard; 