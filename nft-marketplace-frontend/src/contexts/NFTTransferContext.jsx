import React, { createContext, useContext, useEffect } from 'react';
import { useWeb3 } from '../hooks/useWeb3';
import { ethers } from 'ethers';
import { toast } from 'react-hot-toast';
import { addNFTToMetamask } from '../utils/metamask';

const NFTTransferContext = createContext();

export const useNFTTransfer = () => {
  const context = useContext(NFTTransferContext);
  if (!context) {
    throw new Error('useNFTTransfer must be used within a NFTTransferProvider');
  }
  return context;
};

export const NFTTransferProvider = ({ children }) => {
  const { library, account, active } = useWeb3();

  useEffect(() => {
    if (!active || !library || !account) {
      return;
    }

    // Create a map to store active listeners
    const activeListeners = new Map();

    // Function to handle transfer events
    const handleTransfer = (contract, tokenId) => async (from, to, id) => {
      console.log('Transfer detected:', { from, to, id: id.toString() });
      // Only handle if the current user is the receiver
      if (window.ethereum && to.toLowerCase() === account.toLowerCase()) {
        try {
          await addNFTToMetamask(
            window.ethereum,
            contract.address,
            id.toString()
          );
          toast.success('NFT has been automatically added to your MetaMask');
        } catch (error) {
          console.error('Error adding NFT to MetaMask:', error);
          toast.error('Please import the NFT manually in MetaMask');
        }
      }
    };

    // Function to setup listener for a contract
    const setupContractListener = async (contractAddress) => {
      try {
        // Skip if listener already exists for this contract
        if (activeListeners.has(contractAddress)) {
          return;
        }

        const contract = new ethers.Contract(
          contractAddress,
          ["event Transfer(address indexed from, address indexed to, uint256 indexed tokenId)"],
          library.getSigner()
        );

        // Listen for all Transfer events to the current user
        const filter = contract.filters.Transfer(null, account, null);
        const listener = handleTransfer(contract);
        contract.on(filter, listener);

        // Store the cleanup function
        activeListeners.set(contractAddress, () => {
          contract.off(filter, listener);
        });

      } catch (error) {
        console.error('Error setting up contract listener:', error);
      }
    };

    // Setup listeners for known NFT contracts
    // You can add your known NFT contract addresses here
    const knownContracts = [
      // Add your NFT contract addresses here
      // Example: "0x123..."
    ];

    knownContracts.forEach(setupContractListener);

    // Cleanup function
    return () => {
      activeListeners.forEach(cleanup => cleanup());
      activeListeners.clear();
    };
  }, [active, library, account]);

  return (
    <NFTTransferContext.Provider value={{}}>
      {children}
    </NFTTransferContext.Provider>
  );
}; 