import { Link } from 'react-router-dom';
import { formatAddress } from '../../utils/algorithm';

const CollectionCard = ({ address, onToggleDetails }) => {
  return (
    <div className="group relative">
      {/* Animated background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 via-blue-400/5 to-cyan-500/5 opacity-0 group-hover:opacity-100 transition-all duration-500 rounded-xl"></div>
      
      <div className="glass-panel p-6 rounded-xl hover:bg-dark-200/50 transition-all duration-300 border border-cyan-500/10 hover:border-cyan-500/20 flex flex-col sm:flex-row justify-between gap-4 backdrop-blur-md relative overflow-hidden">
        {/* Left section with address and icons */}
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-400 flex items-center justify-center shadow-lg group-hover:shadow-cyan-500/20 transition-all duration-300">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" viewBox="0 0 20 20" fill="currentColor">
              <path d="M7 3a1 1 0 000 2h6a1 1 0 100-2H7zM4 7a1 1 0 011-1h10a1 1 0 110 2H5a1 1 0 01-1-1zM2 11a2 2 0 012-2h12a2 2 0 012 2v4a2 2 0 01-2 2H4a2 2 0 01-2-2v-4z" />
            </svg>
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <span className="text-xs text-cyan-400 font-medium uppercase tracking-wider">Contract</span>
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse"></span>
            </div>
            <p className="font-mono text-sm text-gray-300 break-all group-hover:text-white transition-colors">
              {address}
            </p>
          </div>
        </div>

        {/* Right section with buttons */}
        <div className="flex items-center gap-3 sm:ml-auto">
          <Link 
            to={`/collection/${address}`}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-cyan-500 to-blue-400 rounded-lg text-white text-sm font-medium hover:opacity-90 transition-all duration-300 shadow-lg hover:shadow-cyan-500/20 transform hover:-translate-y-0.5"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
              <path d="M11 3a1 1 0 100 2h2.586l-6.293 6.293a1 1 0 101.414 1.414L15 6.414V9a1 1 0 102 0V4a1 1 0 00-1-1h-5z" />
              <path d="M5 5a2 2 0 00-2 2v8a2 2 0 002 2h8a2 2 0 002-2v-3a1 1 0 10-2 0v3H5V7h3a1 1 0 000-2H5z" />
            </svg>
            View NFTs
          </Link>
          <button 
            onClick={() => onToggleDetails(address)}
            className="p-2 bg-dark-300/50 hover:bg-dark-300/70 rounded-lg transition-all duration-300 border border-cyan-500/10 hover:border-cyan-500/20 group/btn"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-cyan-400 transform transition-transform duration-300 group-hover/btn:rotate-90" viewBox="0 0 20 20" fill="currentColor">
              <path d="M6 10a2 2 0 11-4 0 2 2 0 014 0zM12 10a2 2 0 11-4 0 2 2 0 014 0zM16 12a2 2 0 100-4 2 2 0 000 4z" />
            </svg>
          </button>
        </div>

        {/* Hover gradient line */}
        <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-cyan-500 to-blue-400 opacity-0 group-hover:opacity-100 transition-all duration-500"></div>
      </div>
    </div>
  );
};

export default CollectionCard; 