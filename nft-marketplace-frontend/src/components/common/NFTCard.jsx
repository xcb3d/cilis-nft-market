import { Link } from 'react-router-dom';
import React, { useState, useEffect, useMemo } from 'react';
import { ethers } from 'ethers';
import { useWeb3 } from '../../hooks/useWeb3';
import { LazyLoadImage } from 'react-lazy-load-image-component';
import 'react-lazy-load-image-component/src/effects/blur.css';
import { normalizeIPFSUrl } from '../../utils/algorithm';

// ERC721 ABI với các functions cần thiết
const ERC721_ABI = [
  "function tokenURI(uint256 tokenId) view returns (string)",
  "function name() view returns (string)"
];


// Function để fetch với fallback
const fetchWithFallback = async (url) => {
  if (typeof url === 'string') {
    return fetch(url);
  }
  
  if (Array.isArray(url)) {
    let lastError;
    
    for (const fallbackUrl of url) {
      try {
        const response = await fetch(fallbackUrl);
        if (response.ok) {
          return response;
        }
      } catch (err) {
        console.warn(`Failed to fetch from ${fallbackUrl}:`, err);
        lastError = err;
      }
    }
    
    throw lastError || new Error('All IPFS gateways failed');
  }
  
  throw new Error('Invalid URL format');
};

const NFTCard = React.memo(({ nft }) => {
  const [metadata, setMetadata] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [collectionName, setCollectionName] = useState('');
  const { library } = useWeb3();
  const [hovered, setHovered] = useState(false);

  // Fetch metadata và collection name
  useEffect(() => {
    const fetchNFTData = async () => {
      if (!library || !nft.contractAddress) return;
      
      try {
        setLoading(true);
        setError(null);

        // Tạo contract instance
        const contract = new ethers.Contract(
          nft.contractAddress,
          ERC721_ABI,
          library.getSigner()
        );

        // Fetch tokenURI và collection name song song
        const [tokenURI, name] = await Promise.all([
          contract.tokenURI(nft.id),
          contract.name()
        ]);

        // Set collection name
        setCollectionName(name);

        // Normalize tokenURI
        const normalizedTokenURI = normalizeIPFSUrl(tokenURI);

        // Fetch metadata
        const response = await fetchWithFallback(normalizedTokenURI);
        const metadataResponse = await response.json();

        // Normalize image URL nếu có
        if (metadataResponse.image) {
          metadataResponse.image = normalizeIPFSUrl(metadataResponse.image);
        }

        setMetadata(metadataResponse);
      } catch (err) {
        console.error('Error fetching NFT data:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchNFTData();
  }, [nft.contractAddress, nft.id, library]);

  // Random gradient cho placeholder
  const getRandomGradient = () => {
    const gradients = [
      'from-purple-600 to-blue-500',
      'from-blue-500 to-teal-400',
      'from-green-400 to-cyan-500',
      'from-yellow-400 to-orange-500',
      'from-pink-500 to-rose-500',
    ];
    return gradients[Math.floor(Math.random() * gradients.length)];
  };
  
  const [gradient] = useMemo(() => getRandomGradient(), []);

  if (loading) {
    return (
      <div className="w-[300px] h-[420px] animate-pulse">
        <div className="bg-glass-white rounded-2xl h-full p-4">
          <div className="w-full h-[270px] bg-glass-white/20 rounded-xl mb-4" />
          <div className="space-y-3">
            <div className="h-4 bg-glass-white/20 rounded w-3/4" />
            <div className="h-4 bg-glass-white/20 rounded w-1/2" />
            <div className="h-4 bg-glass-white/20 rounded w-2/3" />
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-[300px] h-[420px]">
        <div className="bg-glass-white rounded-2xl h-full p-4 text-center border border-red-500/20 hover:border-red-500/40 transition-all duration-300">
          <div className="w-full h-[270px] rounded-xl overflow-hidden mb-4 bg-gradient-to-br from-red-500/10 to-orange-500/10 flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <p className="text-red-500 text-sm mb-2">Error loading NFT</p>
          <p className="text-gray-400 text-xs font-mono break-all">{nft.contractAddress}/{nft.id}</p>
        </div>
      </div>
    );
  }

  if (!metadata) {
    return (
      <div className="w-[300px] h-[420px]">
        <div className="bg-glass-white rounded-2xl h-full p-4 text-center">
          <div className="w-full h-[270px] rounded-xl overflow-hidden mb-4 bg-gradient-to-br from-cyan-500/10 to-blue-400/10 flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
          <p className="text-gray-400">No metadata available</p>
        </div>
      </div>
    );
  }

  return (
    <Link 
      to={`/nft/${nft.contractAddress}/${nft.id}`} 
      className="block w-[300px] h-[420px]"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div className="bg-glass-white rounded-2xl h-full p-4 transition-all duration-500 hover:shadow-xl hover:shadow-cyan-500/10 border border-white/10 hover:border-cyan-500/20">
        {/* Image Container - Fixed height */}
        <div className="w-full h-[270px] rounded-xl overflow-hidden mb-4 relative">
          {metadata.image ? (
            <LazyLoadImage
              src={metadata.image}
              alt={metadata.name}
              effect="blur"
              className={`w-full h-full object-cover transition-all duration-500 ${
                hovered ? 'scale-110' : 'scale-100'
              }`}
              placeholderSrc="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjQwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iNDAwIiBoZWlnaHQ9IjQwMCIgZmlsbD0iIzEyMTIxMiIvPjwvc3ZnPg=="
              onError={(e) => {
                e.target.src = 'https://images.unsplash.com/photo-1634973357973-f2ed2657db3c?w=400&h=400&fit=crop';
              }}
            />
          ) : (
            <div className={`w-full h-full bg-gradient-to-br ${gradient} flex items-center justify-center`}>
              <span className="text-white font-bold text-2xl">{metadata.name?.charAt(0) || '#'}</span>
            </div>
          )}
          
          {/* Collection badge with improved styling */}
          <div className="absolute top-2 left-2 bg-dark-100/90 backdrop-blur-sm px-3 py-1.5 rounded-lg text-xs font-medium border border-cyan-500/20 shadow-lg">
            {collectionName || 'Collection'}
          </div>

          {/* Hover overlay with gradient */}
          <div className={`absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 transition-opacity duration-300 ${
            hovered ? 'opacity-100' : ''
          }`} />
        </div>
        
        {/* Content Container - Fixed height */}
        <div className="h-[110px] overflow-hidden">
          {/* Title with ellipsis */}
          <h3 className="font-semibold text-lg mb-2 truncate">
            {metadata.name || `NFT #${nft.id}`}
          </h3>
          
          {/* Description with line clamp */}
          {metadata.description && (
            <p className="text-gray-400 text-sm line-clamp-2 mb-2">
              {metadata.description}
            </p>
          )}
          
          {/* Attributes with scrolling */}
          {metadata.attributes && metadata.attributes.length > 0 && (
            <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-2">
              {metadata.attributes.slice(0, 3).map((attr, index) => (
                <span
                  key={index}
                  className="flex-shrink-0 px-2 py-1 bg-glass-dark rounded-lg text-xs whitespace-nowrap"
                >
                  {attr.trait_type}: {attr.value}
                </span>
              ))}
              {metadata.attributes.length > 3 && (
                <span className="flex-shrink-0 px-2 py-1 bg-glass-dark rounded-lg text-xs whitespace-nowrap">
                  +{metadata.attributes.length - 3}
                </span>
              )}
            </div>
          )}
        </div>
      </div>
    </Link>
  );
});

export default NFTCard; 