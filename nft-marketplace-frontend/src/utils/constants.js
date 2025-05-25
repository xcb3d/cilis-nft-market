export const SUPPORTED_CHAINS = {
    localhost: 1337,
    // Thêm các mạng khác khi deploy
  };
  
export const CHAIN_NAMES = {
    1337: 'Localhost',
  };
  
export const RPC_URLS = {
    1337: 'http://127.0.0.1:8545/',
  };
  
export const CONTRACT_ADDRESSES = {
    1337: {
      collectionFactory: '0x7353956B0590d46c6d85F1E9aa284b5c3021208e',
      marketplace: '0x7Be3f2bAFB68524BB3E8cdF64b937e3502C69fa5'
    }
  };

// Thêm export cho contract ABIs
export { default as CollectionFactoryABI } from '../contracts/abis/CollectionFactory.json';
export { default as NFTCollectionABI } from '../contracts/abis/NFTCollection.json';
export { default as MarketplaceABI } from '../contracts/abis/Marketplace.json';