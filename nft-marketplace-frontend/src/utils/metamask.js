export const addNFTToMetamask = async (ethereum, tokenAddress, tokenId, tokenURI) => {
  try {
    // Request to add the NFT to MetaMask
    const wasAdded = await ethereum.request({
      method: 'wallet_watchAsset',
      params: {
        type: 'ERC721', // NFT type
        options: {
          address: tokenAddress, // The address of the token's contract
          tokenId: tokenId, // The token ID
        },
      },
    });

    if (wasAdded) {
      console.log('NFT was added to MetaMask');
      return true;
    }
    return false;
  } catch (error) {
    console.error('Error adding NFT to MetaMask:', error);
    return false;
  }
}; 