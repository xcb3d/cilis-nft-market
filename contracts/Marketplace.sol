// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "./interfaces/IMarketplace.sol";

contract Marketplace is IMarketplace, ReentrancyGuard, Ownable {
    // Platform fee percentage (2.5% = 250)
    uint256 public constant PLATFORM_FEE = 250; // 2.5%
    uint256 private constant PERCENTAGE_BASE = 10000; // 100%

    // Counter for listing IDs
    uint256 private _listingIdCounter;
    
    // Mapping from listingId to Listing
    mapping(uint256 => Listing) private _listings;

    constructor() Ownable() {}

    function listNFT(
        address collection,
        uint256 tokenId,
        uint256 price
    ) external returns (uint256) {
        require(price > 0, "Price must be greater than 0");
        require(
            IERC721(collection).ownerOf(tokenId) == msg.sender,
            "Not token owner"
        );
        require(
            IERC721(collection).getApproved(tokenId) == address(this),
            "Marketplace not approved"
        );

        _listingIdCounter++;
        uint256 listingId = _listingIdCounter;

        _listings[listingId] = Listing({
            collection: collection,
            tokenId: tokenId,
            seller: msg.sender,
            price: price,
            isActive: true
        });

        emit NFTListed(
            listingId,
            collection,
            tokenId,
            msg.sender,
            price
        );

        return listingId;
    }

    function cancelListing(uint256 listingId) external {
        Listing storage listing = _listings[listingId];
        require(listing.isActive, "Listing not active");
        require(listing.seller == msg.sender, "Not seller");

        listing.isActive = false;

        emit ListingCanceled(
            listingId,
            listing.collection,
            listing.tokenId
        );
    }

    function buyNFT(uint256 listingId) 
        external 
        payable 
        nonReentrant 
    {
        Listing storage listing = _listings[listingId];
        require(listing.isActive, "Listing not active");
        require(msg.value >= listing.price, "Insufficient payment");

        listing.isActive = false;

        // Calculate platform fee
        uint256 platformFee = (listing.price * PLATFORM_FEE) / PERCENTAGE_BASE;
        uint256 sellerAmount = listing.price - platformFee;

        // Transfer NFT to buyer
        IERC721(listing.collection).safeTransferFrom(
            listing.seller,
            msg.sender,
            listing.tokenId
        );

        // Transfer funds
        (bool success, ) = listing.seller.call{value: sellerAmount}("");
        require(success, "Transfer to seller failed");

        emit NFTSold(
            listingId,
            listing.collection,
            listing.tokenId,
            listing.seller,
            msg.sender,
            listing.price
        );
    }

    function updatePrice(uint256 listingId, uint256 newPrice) external {
        require(newPrice > 0, "Price must be greater than 0");
        
        Listing storage listing = _listings[listingId];
        require(listing.isActive, "Listing not active");
        require(listing.seller == msg.sender, "Not seller");

        listing.price = newPrice;

        emit PriceUpdated(listingId, newPrice);
    }

    function getListing(uint256 listingId) 
        external 
        view 
        returns (Listing memory) 
    {
        return _listings[listingId];
    }

    // Function to get all active listings for a specific collection
    function getListingsByCollection(address collection) 
        external 
        view 
        returns (Listing[] memory) 
    {
        // First count active listings for the collection
        uint256 activeCount = 0;
        for (uint256 i = 1; i <= _listingIdCounter; i++) {
            if (_listings[i].collection == collection && _listings[i].isActive) {
                activeCount++;
            }
        }
        
        // Create array to store results
        Listing[] memory result = new Listing[](activeCount);
        uint256 currentIndex = 0;
        
        // Fill array with active listings
        for (uint256 i = 1; i <= _listingIdCounter; i++) {
            if (_listings[i].collection == collection && _listings[i].isActive) {
                result[currentIndex] = _listings[i];
                currentIndex++;
            }
        }
        
        return result;
    }

    // Function to get total number of listings for a collection
    function getCollectionListingsCount(address collection) 
        external 
        view 
        returns (uint256) 
    {
        uint256 count = 0;
        for (uint256 i = 1; i <= _listingIdCounter; i++) {
            if (_listings[i].collection == collection && _listings[i].isActive) {
                count++;
            }
        }
        return count;
    }

    // Function to withdraw platform fees
    function withdrawFees() external onlyOwner {
        (bool success, ) = owner().call{value: address(this).balance}("");
        require(success, "Transfer failed");
    }

}
