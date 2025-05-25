import { useState } from 'react';
import NFTCard from '../common/NFTCard';
import Button from '../common/Button';

const TrendingNFTs = () => {
  const [timeFilter, setTimeFilter] = useState('24h');

  const timeFilters = [
    { id: '24h', name: '24h' },
    { id: '7d', name: '7 Days' },
    { id: '30d', name: '30 Days' },
    { id: 'all', name: 'All Time' },
  ];

  const trendingNFTs = [
    {
      id: 1,
      name: "Neon Dreams #123",
      collection: "Neon Collection",
      image: "https://images.unsplash.com/photo-1634973357973-f2ed2657db3c?w=600&h=600&fit=crop",
      price: "1.5",
      likes: 156,
      change: "+12.5%",
    },
    {
      id: 2,
      name: "Abstract Flow #045",
      collection: "Abstract World",
      image: "https://images.unsplash.com/photo-1549490349-8643362247b5?w=600&h=600&fit=crop", 
      price: "2.8",
      likes: 243,
      change: "-5.2%",
    },
    {
      id: 3,
      name: "Digital Wave #078",
      collection: "Digital Art",
      image: "https://images.unsplash.com/photo-1553356084-58ef4a67b2a7?w=600&h=600&fit=crop",
      price: "1.2",
      likes: 189,
      change: "+8.7%",
    },
    {
      id: 4,
      name: "Cyber Space #234",
      collection: "Cyber World",
      image: "https://images.unsplash.com/photo-1614730321146-b6fa6a46bcb4?w=600&h=600&fit=crop",
      price: "3.1",
      likes: 312,
      change: "+15.3%",
    },
    {
      id: 5,
      name: "Color Burst #156",
      collection: "Color Theory",
      image: "https://images.unsplash.com/photo-1541701494587-cb58502866ab?w=600&h=600&fit=crop",
      price: "2.4",
      likes: 278,
      change: "+10.3%",
    },
    {
      id: 6,
      name: "Geometric Art #089",
      collection: "Geometry",
      image: "https://images.unsplash.com/photo-1550859492-d5da9d8e45f3?w=600&h=600&fit=crop",
      price: "1.8",
      likes: 195,
      change: "+6.7%",
    },
    {
      id: 7,
      name: "Future City #445",
      collection: "Future Worlds",
      image: "https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=600&h=600&fit=crop",
      price: "2.9",
      likes: 267,
      change: "+9.4%",
    },
    {
      id: 8,
      name: "Light Trails #323",
      collection: "Light Art",
      image: "https://images.unsplash.com/photo-1550537687-c91072c4792d?w=600&h=600&fit=crop",
      price: "1.7",
      likes: 234,
      change: "+11.2%",
    }
  ];

  return (
    <section className="py-20 relative">
      {/* Background Effects */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-radial from-neon-pink/10 via-transparent to-transparent opacity-30" />
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row justify-between items-center mb-12">
          <div className="text-center sm:text-left mb-6 sm:mb-0">
            <h2 className="text-4xl font-display font-bold mb-4">
              <span className="heading-gradient">Trending NFTs</span>
            </h2>
            <p className="text-xl text-gray-400">
              The most popular NFTs on the marketplace
            </p>
          </div>

          {/* Time Filters */}
          <div className="glass-panel p-1 inline-flex rounded-xl">
            {timeFilters.map((filter) => (
              <button
                key={filter.id}
                onClick={() => setTimeFilter(filter.id)}
                className={`px-4 py-2 rounded-lg transition-all duration-300 ${
                  timeFilter === filter.id
                    ? 'bg-gradient-to-r from-neon-purple to-neon-pink text-white'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                {filter.name}
              </button>
            ))}
          </div>
        </div>

        {/* NFTs Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {trendingNFTs.map((nft) => (
            <div key={nft.id} className="group h-full">
              <div className="relative h-full transform transition-all duration-300 hover:scale-105">
                <NFTCard nft={nft} />
                {nft.change && (
                  <div className="absolute top-4 right-4 glass-panel px-3 py-1 rounded-full">
                    <span className={`text-sm font-medium ${
                      nft.change?.startsWith('+') ? 'text-green-400' : 'text-red-400'
                    }`}>
                      {nft.change}
                    </span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* View More Button */}
        <div className="text-center mt-12">
          <Button variant="glass" className="group">
            <span className="flex items-center gap-2">
              View All Trending
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

export default TrendingNFTs; 