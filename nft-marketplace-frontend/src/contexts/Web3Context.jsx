import { createContext, useEffect, useState } from 'react';
import { ethers } from 'ethers';
import { useWeb3React } from '@web3-react/core';
import { injected } from '../utils/connectors';
import { CHAIN_NAMES, SUPPORTED_CHAINS } from '../utils/constants';
import toast from 'react-hot-toast';

export const Web3Context = createContext(null);

export const Web3Provider = ({ children }) => {
  const { activate, deactivate, active, account, library, chainId } = useWeb3React();
  const [isLoading, setIsLoading] = useState(false);
  const [tried, setTried] = useState(false);

  // Kết nối wallet
  const connectWallet = async () => {
    setIsLoading(true);
    try {
      await activate(injected, undefined, true);
      toast.success('Wallet connected successfully!');
    } catch (error) {
      toast.error('Failed to connect wallet');
      console.error('Connection Error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Ngắt kết nối wallet
  const disconnectWallet = async () => {
    try {
      deactivate();
      localStorage.removeItem('shouldConnectWallet');
      toast.success('Wallet disconnected');
    } catch (error) {
      toast.error('Failed to disconnect wallet');
      console.error('Disconnect Error:', error);
    }
  };

  // Kiểm tra mạng có được hỗ trợ
  const checkNetwork = () => {
    if (!chainId || !Object.values(SUPPORTED_CHAINS).includes(chainId)) {
      toast.error(`Please switch to ${CHAIN_NAMES[SUPPORTED_CHAINS.localhost]}`);
      return false;
    }
    return true;
  };

  // Eagerly connect to MetaMask
  useEffect(() => {
    async function attemptEagerConnect() {
      if (!tried) {
        try {
          // Check if MetaMask is installed
          const isAuthorized = await injected.isAuthorized();
          if (isAuthorized) {
            await activate(injected, undefined, true);
          }
        } catch (error) {
          console.error('Eager Connect Error:', error);
        } finally {
          setTried(true);
        }
      }
    }
    attemptEagerConnect();
  }, [activate, tried]);

  // Listen for account changes
  useEffect(() => {
    const { ethereum } = window;
    if (ethereum && ethereum.on) {
      const handleAccountsChanged = (accounts) => {
        if (accounts.length > 0) {
          // We got a new account, activate it
          activate(injected, undefined, true);
        } else {
          // MetaMask is locked or the user has not connected any accounts
          deactivate();
        }
      };

      const handleChainChanged = (chainId) => {
        // Handle the new chain
        // Typically we'd want to call activate(injected) here
        console.log("Chain changed to:", chainId);
        activate(injected);
      };

      const handleDisconnect = () => {
        deactivate();
      };

      ethereum.on('accountsChanged', handleAccountsChanged);
      ethereum.on('chainChanged', handleChainChanged);
      ethereum.on('disconnect', handleDisconnect);

      return () => {
        if (ethereum.removeListener) {
          ethereum.removeListener('accountsChanged', handleAccountsChanged);
          ethereum.removeListener('chainChanged', handleChainChanged);
          ethereum.removeListener('disconnect', handleDisconnect);
        }
      };
    }
  }, [activate, deactivate]);

  // Lưu trạng thái connect để auto connect
  useEffect(() => {
    if (active && account) {
      localStorage.setItem('shouldConnectWallet', 'true');
    }
  }, [active, account]);

  // Log trạng thái để debug
  useEffect(() => {
    console.log('Web3 Context State:', { active, account, isLoading, chainId });
  }, [active, account, isLoading, chainId]);

  const value = {
    connectWallet,
    disconnectWallet,
    checkNetwork,
    isLoading,
    active,
    account,
    library,
    chainId,
  };

  return <Web3Context.Provider value={value}>{children}</Web3Context.Provider>;
};
