// ERC721 ABI with just the functions we need
export const ERC721_ABI = [
    "function ownerOf(uint256 tokenId) view returns (address)",
    "function tokenURI(uint256 tokenId) view returns (string)",
    "function name() view returns (string)",
    "function symbol() view returns (string)",
    "function getApproved(uint256 tokenId) view returns (address)",
    "function approve(address to, uint256 tokenId) external",
    "function getCreator(uint256 tokenId) view returns (address)",
    "event Transfer(address indexed from, address indexed to, uint256 indexed tokenId)",
    "function balanceOf(address owner) view returns (uint256)",
    "function totalSupply() view returns (uint256)"
];

// Marketplace ABI for events
export const MARKETPLACE_EVENTS_ABI = [
    "event NFTListed(uint256 indexed listingId, address indexed collection, uint256 indexed tokenId, address seller, uint256 price)",
    "event NFTSold(uint256 indexed listingId, address indexed collection, uint256 indexed tokenId, address seller, address buyer, uint256 price)",
    "event ListingCanceled(uint256 indexed listingId, address indexed collection, uint256 indexed tokenId)",
    "event PriceUpdated(uint256 indexed listingId, uint256 newPrice)"
];

// Add NFTMinted event to the ABI
export const NFT_MINTED_EVENT = [
    "event NFTMinted(uint256 indexed tokenId, address indexed creator, string tokenURI)"
];