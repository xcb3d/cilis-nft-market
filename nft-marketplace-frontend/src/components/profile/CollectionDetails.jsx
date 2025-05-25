import { useEffect, useState } from 'react';
import { useWeb3 } from '../../hooks/useWeb3';
import { ethers } from 'ethers';
import { NFTCollectionABI } from '../../utils/constants';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { formatAddress } from '../../utils/algorithm';

const CollectionDetails = ({ address }) => {
  const { library } = useWeb3();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [collectionInfo, setCollectionInfo] = useState(null);
  const [hovered, setHovered] = useState(false);

  // Fetch collection info from smart contract
  useEffect(() => {
    const fetchCollectionDetails = async () => {
      if (!library || !address) return;
      
      try {
        setLoading(true);
        setError(null);
        
        const collectionContract = new ethers.Contract(
          address,
          NFTCollectionABI.abi,
          library.getSigner()
        );
        
        const timeoutPromise = new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Request timed out after 10s')), 10000)
        );
        
        const info = await Promise.race([
          collectionContract.getCollectionInfo(),
          timeoutPromise
        ]);

        const response = await axios.get(`${import.meta.env.VITE_PINATA_GATEWAY_URL}`+ info.urlMetadata.replace('ipfs://', ''));
        const mediaData = response.data;
        
        setCollectionInfo({
          name: info.name,
          symbol: info.symbol,
          owner: info.owner_,
          totalSupply: Number(info.totalSupply),
          banner: mediaData.banner.replace('ipfs://', import.meta.env.VITE_PINATA_GATEWAY_URL),
          logo: mediaData.image.replace('ipfs://', import.meta.env.VITE_PINATA_GATEWAY_URL),
          category: mediaData?.category,
          description: mediaData?.description
        });
      } catch (err) {
        console.error(`Error fetching details for collection ${address}:`, err);
        setError(err.message || 'Failed to fetch collection details');
      } finally {
        setLoading(false);
      }
    };
    
    fetchCollectionDetails();
  }, [address, library]);

  if (loading) {
    return (
      <div className="p-3 bg-dark-200/30 rounded-xl animate-pulse backdrop-blur-md border border-cyan-500/10">
        <div className="h-64 bg-gradient-to-br from-cyan-500/5 to-blue-400/5 rounded-t-xl mb-4"></div>
        <div className="h-8 bg-gradient-to-r from-cyan-500/10 to-blue-400/10 rounded-lg w-1/3 mb-3"></div>
        <div className="h-6 bg-gradient-to-r from-cyan-500/10 to-blue-400/10 rounded-lg w-1/2 mb-3"></div>
        <div className="h-6 bg-gradient-to-r from-cyan-500/10 to-blue-400/10 rounded-lg w-1/4"></div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="p-6 bg-dark-200/30 rounded-xl backdrop-blur-md border border-red-500/20 group hover:border-red-500/30 transition-all duration-300">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-red-500/50 to-orange-500/50 flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
          </div>
          <div>
            <p className="font-mono text-sm text-white/80 break-all mb-2">{address}</p>
            <p className="text-red-400 text-sm group-hover:text-red-300 transition-colors">Error: {error}</p>
          </div>
        </div>
      </div>
    );
  }
  
  if (!collectionInfo) return null;

  return (
    <div 
      className="bg-dark-200/30 rounded-2xl overflow-hidden backdrop-blur-md shadow-xl hover:shadow-2xl transform hover:-translate-y-2 transition-all duration-500 border border-white/10 group relative"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Animated background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 via-blue-400/5 to-cyan-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
      
      {/* Banner image with enhanced parallax effect */}
      <div className="h-64 w-full overflow-hidden relative">
        {collectionInfo?.banner ? (
          <img 
            src={collectionInfo?.banner} 
            alt={`${collectionInfo.name} banner`}
            className={`w-full h-full object-cover transition-all duration-1000 ease-out ${hovered ? 'scale-110 blur-sm' : 'scale-100 blur-0'}`}
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = 'https://via.placeholder.com/800x200?text=Banner+Not+Available';
            }}
          />
        ) : (
          <div className="h-full w-full bg-gradient-to-br from-cyan-500/30 via-blue-400/20 to-cyan-500/30 flex items-center justify-center animate-gradient-xy">
            <span className="text-white/50 text-lg font-medium tracking-wider">No Banner Available</span>
          </div>
        )}
        
        {/* Enhanced gradient overlay with animation */}
        <div className="absolute inset-0 bg-gradient-to-t from-dark-100/95 via-dark-100/70 to-transparent opacity-90 group-hover:opacity-75 transition-all duration-500"></div>
        
        {/* Collection name overlay with animation */}
        <div className="absolute bottom-0 left-0 right-0 p-8 transform transition-all duration-500 group-hover:translate-y-[-4px]">
          <h3 className="text-4xl font-bold text-white drop-shadow-lg mb-3 line-clamp-1 bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-blue-500">
            {collectionInfo.name}
          </h3>
          <div className="flex items-center gap-3 flex-wrap">
            <span className="px-4 py-1.5 bg-cyan-500/10 rounded-full text-cyan-300 text-sm backdrop-blur-md border border-cyan-500/20 shadow-lg">
              {collectionInfo.symbol}
            </span>
            <span className="text-white/60 text-sm">•</span>
          </div>
        </div>
        
        {/* Enhanced NFT count badge */}
        <div className="absolute top-6 right-6 bg-dark-100/80 backdrop-blur-xl px-5 py-2.5 rounded-full text-sm font-medium border border-cyan-500/20 shadow-xl flex items-center gap-3 transform transition-all duration-500 group-hover:scale-105 hover:border-cyan-400/30">
          <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-pulse shadow-lg shadow-cyan-500/50"></span>
          <span className="font-semibold bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-blue-500">{collectionInfo.totalSupply}</span>
          <span className="text-white/70">NFTs</span>
        </div>
      </div>
      
      <div className="p-8 relative">
        {/* Enhanced logo image */}
        <div className="absolute -top-24 left-8 w-32 h-32 rounded-2xl overflow-hidden border-4 border-dark-100 shadow-2xl bg-dark-200 transition-all duration-500 hover:scale-105 group-hover:border-cyan-500/30 group-hover:shadow-cyan-500/20">
          {collectionInfo?.logo ? (
            <img 
              src={collectionInfo?.logo} 
              alt={`${collectionInfo.name} logo`}
              className="w-full h-full object-cover transition-all duration-500 group-hover:scale-110"
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = 'https://via.placeholder.com/200x200?text=Logo';
              }}
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-cyan-500/50 to-blue-400/50 flex items-center justify-center animate-gradient-xy p-2">
              <span className="text-white font-bold text-4xl drop-shadow-lg">{collectionInfo.symbol.charAt(0)}</span>
            </div>
          )}
        </div>
        
        {/* Enhanced description with gradient border */}
        {collectionInfo?.description && (
          <div className="mt-12 mb-8 p-5 rounded-xl bg-dark-300/30 border border-cyan-500/10 backdrop-blur-xl hover:bg-dark-300/40 transition-all duration-300 group-hover:border-cyan-500/20">
            <div className="flex items-start gap-3">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-cyan-400/50 mt-0.5 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
              <p className="text-gray-300 text-sm leading-relaxed">
                {collectionInfo.description}
              </p>
            </div>
          </div>
        )}
        
        {/* Enhanced collection info */}
        <div className="grid grid-cols-2 gap-4">
          <div className="p-5 rounded-xl bg-dark-300/20 border border-cyan-500/10 backdrop-blur-xl hover:bg-dark-300/30 transition-all duration-300 group-hover:border-cyan-500/20">
            <p className="text-xs text-gray-400 mb-3 uppercase tracking-wider font-medium">Owner</p>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-400 flex items-center justify-center shadow-lg group-hover:shadow-cyan-500/20">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                </svg>
              </div>
              <p className="text-sm font-mono text-white/90 hover:text-cyan-400 transition-colors">
                {collectionInfo?.owner ? `${formatAddress(collectionInfo.owner)}` : 'Loading...'}
              </p>
            </div>
          </div>
          <div className="p-5 rounded-xl bg-dark-300/20 border border-cyan-500/10 backdrop-blur-xl hover:bg-dark-300/30 transition-all duration-300 group-hover:border-cyan-500/20">
            <p className="text-xs text-gray-400 mb-3 uppercase tracking-wider font-medium">Contract Address</p>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-400 flex items-center justify-center shadow-lg group-hover:shadow-cyan-500/20">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M4 4a2 2 0 012-2h8a2 2 0 012 2v12a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm3 1h6v4H7V5zm6 6H7v2h6v-2z" clipRule="evenodd" />
                </svg>
              </div>
              <p className="text-sm font-mono text-white/90 hover:text-cyan-400 transition-colors">
                {address ? `${formatAddress(address)}` : 'N/A'}
              </p>
            </div>
          </div>
        </div>
        
        {/* Enhanced action buttons */}
        <div className="mt-8 flex gap-4">
          <Link 
            to={`/collection/${address}`}
            className="flex-1 px-6 py-4 bg-gradient-to-r from-cyan-500 to-blue-400 rounded-xl text-center text-sm font-medium hover:opacity-90 transition-all duration-500 shadow-xl hover:shadow-cyan-500/30 transform hover:-translate-y-1 flex items-center justify-center gap-3 group/btn"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 transition-transform duration-500 group-hover/btn:rotate-12" viewBox="0 0 20 20" fill="currentColor">
              <path d="M7 3a1 1 0 000 2h6a1 1 0 100-2H7zM4 7a1 1 0 011-1h10a1 1 0 110 2H5a1 1 0 01-1-1zM2 11a2 2 0 012-2h12a2 2 0 012 2v4a2 2 0 01-2 2H4a2 2 0 01-2-2v-4z" />
            </svg>
            <span className="font-medium">View Collection</span>
          </Link>
          <button className="p-4 bg-dark-300/50 hover:bg-dark-300/70 rounded-xl text-sm transition-all duration-300 border border-cyan-500/10 hover:border-cyan-500/20 group/menu relative overflow-hidden">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 transform transition-transform duration-500 group-hover/menu:rotate-90" viewBox="0 0 20 20" fill="currentColor">
              <path d="M6 10a2 2 0 11-4 0 2 2 0 014 0zM12 10a2 2 0 11-4 0 2 2 0 014 0zM16 12a2 2 0 100-4 2 2 0 000 4z" />
            </svg>
            <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/10 to-blue-400/10 opacity-0 group-hover/menu:opacity-100 transition-opacity duration-500"></div>
          </button>
        </div>
      </div>
    </div>
  );
};

export default CollectionDetails; 