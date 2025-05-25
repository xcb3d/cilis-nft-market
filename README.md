# Cilis NFT Marketplace

A full-featured NFT marketplace platform built with Hardhat, Solidity, React, Vite, and TailwindCSS.

## Features

- Create, buy, sell, and trade NFTs
- Create custom NFT collections
- Connect with Web3 wallets using RainbowKit and wagmi
- Real-time marketplace updates
- User-friendly interface with TailwindCSS
- Fully responsive design
- Comprehensive testing suite


### Smart Contracts

1. Clone the repository
   ```bash
   git clone https://github.com/yourusername/cilis-nft-market.git
   cd cilis-nft-market
   ```

2. Install dependencies
   ```bash
   npm install
   ```

3. Start local Hardhat node
   ```bash
   npx hardhat node
   ```

4. Deploy contracts to the local network
   ```bash
   npx hardhat run scripts/deploy.js --network localhost
   ```

### Frontend

1. Navigate to the frontend directory
   ```bash
   cd nft-marketplace-frontend
   ```

2. Install dependencies
   ```bash
   npm install
   ```

3. Create a `.env` file with appropriate configurations (copy from `.env.example` if available)

4. Start the development server
   ```bash
   npm run dev
   ```

5. Open your browser and navigate to `http://localhost:5173`
