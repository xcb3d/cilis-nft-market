import React from 'react';
import { formatAddress, formatDate } from '../../../utils/algorithm';

const TransactionHistory = ({
  loadingHistory,
  transactionHistoryError,
  transactionHistory,
  fetchTransactionHistory
}) => {
  if (loadingHistory) {
    return (
      <div className="flex justify-center py-8">
        <div className="w-8 h-8 border-2 border-neon-purple border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (transactionHistoryError) {
    return (
      <div className="text-center py-4">
        <div className="w-12 h-12 mx-auto mb-3 text-red-500">
          <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <p className="text-red-400 mb-2">Error loading transaction history</p>
        <p className="text-sm text-gray-400 mb-4 max-w-md mx-auto">{transactionHistoryError}</p>
        <button 
          onClick={fetchTransactionHistory}
          className="px-4 py-2 bg-neon-purple/20 hover:bg-neon-purple/30 rounded-lg transition-colors"
        >
          Try Again
        </button>
      </div>
    );
  }

  if (!transactionHistory.length) {
    return <p className="text-gray-400 text-center py-4">No transaction history available</p>;
  }

  return (
    <div className="space-y-4">
      {transactionHistory.map((transaction, index) => (
        <div key={index} className="flex items-center justify-between py-3 border-b border-white/5">
          <div className="flex items-center gap-3">
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
              transaction.type === 'minted' ? 'bg-neon-purple/20' :
              transaction.type === 'listed' ? 'bg-neon-blue/20' :
              transaction.type === 'cancelled' ? 'bg-red-500/20' :
              transaction.type === 'sold' ? 'bg-green-500/20' :
              transaction.type === 'transferred' ? 'bg-blue-500/20' :
              'bg-gray-500/20'
            }`}>
              {getTransactionIcon(transaction.type)}
            </div>
            <div>
              <p className="font-medium capitalize text-left">{transaction.type}</p>
              <p className="text-sm text-gray-400">
                {getTransactionDescription(transaction)}
              </p>
            </div>
          </div>
          <p className="text-sm text-gray-400">{formatDate(transaction.timestamp)}</p>
        </div>
      ))}
    </div>
  );
};

const getTransactionIcon = (type) => {
  switch (type) {
    case 'minted':
      return (
        <svg className="w-4 h-4 text-neon-purple" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
        </svg>
      );
    case 'listed':
      return (
        <svg className="w-4 h-4 text-neon-blue" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 11l5-5m0 0l5 5m-5-5v12" />
        </svg>
      );
    case 'cancelled':
      return (
        <svg className="w-4 h-4 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      );
    case 'sold':
      return (
        <svg className="w-4 h-4 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>
      );
    case 'transferred':
      return (
        <svg className="w-4 h-4 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
        </svg>
      );
    default:
      return null;
  }
};

const getTransactionDescription = (transaction) => {
  switch (transaction.type) {
    case 'minted':
      return `By ${formatAddress(transaction.to)}`;
    case 'listed':
    case 'cancelled':
      return `By ${formatAddress(transaction.from)}`;
    case 'sold':
    case 'transferred':
      return `From ${formatAddress(transaction.from)} to ${formatAddress(transaction.to)}`;
    default:
      return '';
  }
};

export default TransactionHistory; 