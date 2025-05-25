// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

interface INFTCollection {
    // Event khi mint NFT mới
    event NFTMinted(uint256 indexed tokenId, address indexed creator, string uri);

    // Mint NFT mới
    function mint(string memory uri) external returns (uint256);
    
    // Lấy thông tin creator của NFT
    function getCreator(uint256 tokenId) external view returns (address);

    // Lấy thông tin collection
    function getCollectionInfo() external view returns (
        string memory name,
        string memory symbol,
        address owner,
        uint256 totalSupply,
        string memory urlMetadata
    );

    // Set base URI cho collection
    function setBaseURI(string memory baseURI) external;
}
