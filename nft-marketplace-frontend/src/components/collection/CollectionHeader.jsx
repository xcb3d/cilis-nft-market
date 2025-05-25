import { useCollectionImage } from '../../hooks/useCollectionImage';

const CollectionHeader = ({ collection }) => {
  const { image: banner } = useCollectionImage(collection.banner, 'banner');
  const { image: logo } = useCollectionImage(collection.logo, 'logo');

  return (
    <div className="relative">
      {/* Banner */}
      <div className="h-64 w-full relative">
        <img
          src={banner}
          alt={`${collection.name} banner`}
          className="w-full h-full object-cover"
        />
      </div>

      {/* Logo */}
      <div className="absolute -bottom-16 left-8">
        <img
          src={logo}
          alt={`${collection.name} logo`}
          className="w-32 h-32 rounded-full border-4 border-white shadow-lg"
        />
      </div>
    </div>
  );
}; 