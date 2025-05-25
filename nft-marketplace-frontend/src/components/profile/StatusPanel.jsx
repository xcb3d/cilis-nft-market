import { Link } from 'react-router-dom';

const StatusPanel = ({ loading, error, contractStatus, collections }) => {
  return (
    <div className="glass-panel p-6 rounded-xl backdrop-blur-md border border-cyan-500/10 shadow-lg">
      <div className="flex items-center gap-3">
        <div className={`w-3 h-3 rounded-full ${error ? 'bg-red-500' : loading ? 'bg-cyan-400 animate-pulse' : 'bg-cyan-500'}`}></div>
        <h3 className="text-lg font-semibold text-gray-200">Contract Status</h3>
      </div>
      
      <p className={`mt-2 ${error ? 'text-red-400' : 'text-gray-300'}`}>
        {contractStatus}
      </p>
      
      {loading && (
        <div className="mt-4 animate-pulse space-y-3">
          <div className="h-3 bg-gradient-to-r from-cyan-500/10 to-blue-400/10 rounded-full w-1/2" />
          <div className="h-3 bg-gradient-to-r from-cyan-500/10 to-blue-400/10 rounded-full w-1/3" />
          <div className="h-3 bg-gradient-to-r from-cyan-500/10 to-blue-400/10 rounded-full w-2/3" />
        </div>
      )}
      
      {error && (
        <div className="mt-4 p-4 bg-red-500/10 border border-red-500/30 rounded-lg">
          <div className="flex items-start gap-3">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            <p className="text-red-400 text-sm">{error}</p>
          </div>
        </div>
      )}
      
      {!loading && collections.length === 0 && !error && (
        <div className="mt-4 p-6 bg-dark-200/50 rounded-lg text-center border border-cyan-500/10">
          <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-cyan-500/30 to-blue-400/30 rounded-full flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-cyan-400" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z" clipRule="evenodd" />
            </svg>
          </div>
          <p className="text-gray-400 mb-4">You haven't created any collections yet.</p>
          <Link 
            to="/create" 
            className="inline-block px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-400 rounded-lg text-sm font-medium hover:opacity-90 transition-all duration-300 shadow-lg hover:shadow-cyan-500/20 transform hover:-translate-y-1"
          >
            Create Your First Collection
          </Link>
        </div>
      )}
    </div>
  );
};

export default StatusPanel; 