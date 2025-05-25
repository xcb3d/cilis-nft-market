// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

interface IMarketplace {
    struct Listing {
        address collection;
        uint256 tokenId;
        address seller;
        uint256 price;
        bool isActive;
    }

    event NFTListed(
        uint256 indexed listingId,
        address indexed collection,
        uint256 indexed tokenId,
        address seller,
        uint256 price
    );

    event NFTSold(
        uint256 indexed listingId,
        address indexed collection,
        uint256 indexed tokenId,
        address seller,
        address buyer,
        uint256 price
    );

    event ListingCanceled(
        uint256 indexed listingId,
        address indexed collection,
        uint256 indexed tokenId
    );

    event PriceUpdated(
        uint256 indexed listingId,
        uint256 newPrice
    );

    function listNFT(
        address collection,
        uint256 tokenId,
        uint256 price
    ) external returns (uint256);

    function cancelListing(uint256 listingId) external;

    function buyNFT(uint256 listingId) external payable;

    function updatePrice(uint256 listingId, uint256 newPrice) external;

    function getListing(uint256 listingId) 
        external 
        view 
        returns (Listing memory);

}
