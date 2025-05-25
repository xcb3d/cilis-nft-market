import { useState, useEffect } from 'react';
import Button from '../common/Button';
import NFTCard from '../common/NFTCard';
import { EthIcon } from '../../assets';

const HeroSection = () => {
  const [activeIndex, setActiveIndex] = useState(0);

  // Auto rotate NFTs
  useEffect(() => {
    const timer = setInterval(() => {
      setActiveIndex((current) => (current + 1) % featuredNFTs.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  const featuredNFTs = [
    {
      id: 1,
      name: "Ethereal Dreams #01",
      collection: "Ethereal Collection",
      image: "https://images.unsplash.com/photo-1634973357973-f2ed2657db3c?w=800&h=800&fit=crop",
      price: "2.5",
      likes: 423,
      creator: "0x1234...5678",
      badge: "Featured"
    },
    {
      id: 2,
      name: "Neon City #08",
      collection: "Cyberpunk World",
      image: "https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=800&h=800&fit=crop",
      price: "3.2",
      likes: 567,
      creator: "0x8765...4321",
      badge: "Trending"
    },
    {
      id: 3,
      name: "Digital Genesis #12",
      collection: "Digital Realms",
      image: "https://images.unsplash.com/photo-1553356084-58ef4a67b2a7?w=800&h=800&fit=crop",
      price: "1.8",
      likes: 289,
      creator: "0x5432...9876",
      badge: "New"
    }
  ];

  return (
    <section className="py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <div className="space-y-8">
            <div className="space-y-4">
              <h1 className="text-5xl sm:text-6xl lg:text-7xl font-display font-bold leading-tight">
                Discover
                <span className="block bg-gradient-to-r from-neon-blue via-neon-purple to-neon-pink bg-clip-text text-transparent">
                  Digital Art &
                </span>
                Collect NFTs
              </h1>
              <p className="text-xl text-gray-400 leading-relaxed max-w-lg">
                Explore the best digital art and NFTs from top creators worldwide. Buy, sell, and collect unique digital assets.
              </p>
            </div>

            <div className="flex flex-wrap gap-4">
              <Button variant="primary" className="text-lg px-8 py-4">
                Explore NFTs
              </Button>
              <Button variant="glass" className="text-lg px-8 py-4">
                Create NFT
              </Button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-8">
              <div className="glass-panel p-4 text-center rounded-2xl">
                <p className="text-3xl font-bold bg-gradient-to-r from-neon-blue to-neon-purple bg-clip-text text-transparent">
                  15K+
                </p>
                <p className="text-gray-400 mt-1">Artworks</p>
              </div>
              <div className="glass-panel p-4 text-center rounded-2xl">
                <p className="text-3xl font-bold bg-gradient-to-r from-neon-purple to-neon-pink bg-clip-text text-transparent">
                  9K+
                </p>
                <p className="text-gray-400 mt-1">Artists</p>
              </div>
              <div className="glass-panel p-4 text-center rounded-2xl">
                <p className="text-3xl font-bold bg-gradient-to-r from-neon-blue to-neon-pink bg-clip-text text-transparent">
                  25K+
                </p>
                <p className="text-gray-400 mt-1">Collectors</p>
              </div>
            </div>
          </div>

          {/* Right Content - Featured NFTs */}
          <div className="relative h-[600px]">
            {/* Featured NFT Cards Container */}
            <div className="relative h-full flex items-center justify-center">
              <div className="relative w-[400px] h-[500px]">
                {featuredNFTs.map((nft, index) => (
                  <div
                    key={nft.id}
                    className={`absolute w-full transition-all duration-700 ease-out transform
                      ${index === activeIndex ? 'translate-y-0 scale-100 opacity-100 z-30' : ''}
                      ${index === (activeIndex + 1) % 3 ? 'translate-y-8 -translate-x-8 scale-95 opacity-60 z-20' : ''}
                      ${index === (activeIndex + 2) % 3 ? 'translate-y-16 -translate-x-16 scale-90 opacity-30 z-10' : ''}
                    `}
                  >
                    <div className="relative group cursor-pointer shadow-xl" 
                         onClick={() => setActiveIndex((activeIndex + 1) % 3)}>
                      {/* Badge */}
                      <div className="absolute -top-3 -right-3 z-50">
                        <div className={`px-4 py-1 rounded-full text-sm font-medium shadow-lg
                          ${nft.badge === 'Featured' ? 'bg-gradient-to-r from-neon-purple to-neon-pink' :
                            nft.badge === 'Trending' ? 'bg-gradient-to-r from-neon-blue to-neon-purple' :
                            'bg-gradient-to-r from-neon-green to-neon-blue'}
                        `}>
                          {nft.badge}
                        </div>
                      </div>

                      {/* Card with enhanced styling */}
                      <div className="relative overflow-hidden rounded-2xl bg-dark-200">
                        {/* Image */}
                        <div className="relative aspect-square overflow-hidden">
                          <img
                            src={nft.image}
                            alt={nft.name}
                            className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700"
                          />
                          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-dark-200/90" />
                        </div>

                        {/* Content Overlay */}
                        <div className="absolute bottom-0 left-0 right-0 p-6">
                          <div className="space-y-2">
                            <p className="text-sm text-gray-300">{nft.collection}</p>
                            <h3 className="text-xl font-bold text-white">{nft.name}</h3>
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-2">
                                <EthIcon />
                                <span className="text-white font-medium">{nft.price} ETH</span>
                              </div>
                              <div className="flex items-center space-x-1">
                                <svg className="w-4 h-4 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                                  <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" />
                                </svg>
                                <span className="text-white">{nft.likes}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Navigation Dots */}
            <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 flex items-center space-x-3">
              {featuredNFTs.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setActiveIndex(index)}
                  className="relative transition-all duration-300"
                >
                  <div className={`w-3 h-3 rounded-full transition-all duration-300 
                    ${index === activeIndex 
                      ? 'bg-gradient-to-r from-neon-purple to-neon-pink scale-125' 
                      : 'bg-gray-400/50 hover:bg-gray-400'
                    }`}
                  />
                  {index === activeIndex && (
                    <div className="absolute -inset-2 bg-neon-purple/20 rounded-full blur animate-pulse" />
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection; 