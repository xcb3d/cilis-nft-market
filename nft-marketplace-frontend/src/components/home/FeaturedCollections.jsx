import { useState } from 'react';
import CollectionCard from '../common/CollectionCard';
import Button from '../common/Button';
import ActiveButton from '../common/ActiveButton';

const FeaturedCollections = () => {
  const [activeCategory, setActiveCategory] = useState('all');

  const categories = [
    { id: 'all', name: 'All' },
    { id: 'art', name: 'Art' },
    { id: 'gaming', name: 'Gaming' },
    { id: 'music', name: 'Music' },
    { id: 'photography', name: 'Photography' },
  ];

  const collections = [
    {
      id: 1,
      name: "Mystic Realms",
      creator: "CryptoArtist",
      verified: true,
      banner: "https://images.unsplash.com/photo-1634973357973-f2ed2657db3c",
      avatar: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe",
      floor: 2.5,
      volume: 1205.8,
      items: 10000,
      category: 'art',
    },
    // Thêm các collections khác...
  ];

  const filteredCollections = activeCategory === 'all'
    ? collections
    : collections.filter(collection => collection.category === activeCategory);

  return (
    <section className="py-20 relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-radial from-neon-blue/10 via-transparent to-transparent opacity-30" />
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-12">
          <h2 className="text-4xl font-display font-bold mb-4">
            <span className="heading-gradient">Featured Collections</span>
          </h2>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto">
            Discover the most outstanding NFT collections
          </p>
        </div>

        {/* Categories */}
        <div className="flex justify-center mb-12">
          <div className="glass-panel p-1 inline-flex rounded-xl">
            {categories.map((category) => (
              <ActiveButton key={category.id} isActive={activeCategory === category.id} onClick={() => setActiveCategory(category.id)}>
                {category.name}
              </ActiveButton>
            ))}
          </div>
        </div>

        {/* Collections Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredCollections.map((collection) => (
            <div key={collection.id} className="transform hover:scale-105 transition-transform duration-300">
              <CollectionCard collection={collection} />
            </div>
          ))}
        </div>

        {/* View More Button */}
        <div className="text-center mt-12">
          <Button variant="glass" className="group">
            <span className="flex items-center gap-2">
              View More Collections
              <svg 
                className="w-5 h-5 transform transition-transform group-hover:translate-x-1" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </span>
          </Button>
        </div>
      </div>
    </section>
  );
};

export default FeaturedCollections; 