// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "./interfaces/INFTCollection.sol";

contract NFTCollection is ERC721URIStorage, Ownable, INFTCollection {
    using Counters for Counters.Counter;
    Counters.Counter private _tokenIds;
    
    string private _baseURIValue;
    string private _collectionName;
    string private _collectionSymbol;
    string private _urlMetadata;

    // Mapping để lưu creator cho mỗi tokenId
    mapping(uint256 => address) private _creators;

    constructor(
        string memory name_,
        string memory symbol_,
        address initialOwner,
        string memory baseURI,
        string memory urlMetadata_
    ) ERC721(name_, symbol_) Ownable() {
        _collectionName = name_;
        _collectionSymbol = symbol_;
        _baseURIValue = baseURI;
        _urlMetadata = urlMetadata_;
        _transferOwnership(initialOwner);
    }

    function mint(string memory uri) 
        external 
        onlyOwner 
        returns (uint256) 
    {
        _tokenIds.increment();
        uint256 newTokenId = _tokenIds.current();
        
        _safeMint(owner(), newTokenId);
        _setTokenURI(newTokenId, uri);
        
        // Lưu creator là msg.sender
        _creators[newTokenId] = msg.sender;
        
        // Emit event
        emit NFTMinted(newTokenId, msg.sender, uri);
        
        return newTokenId;
    }

    // Hàm để lấy creator của một NFT
    function getCreator(uint256 tokenId) 
        external 
        view 
        returns (address) 
    {
        require(_exists(tokenId), "NFT does not exist");
        return _creators[tokenId];
    }

    function getCollectionInfo() 
        external 
        view 
        returns (
            string memory name,
            string memory symbol,
            address owner_,
            uint256 totalSupply,
            string memory urlMetadata
        ) 
    {
        return (
            _collectionName,
            _collectionSymbol,
            owner(),
            _tokenIds.current(),
            _urlMetadata
        );
    }

    function setBaseURI(string memory baseURI) 
        external 
        onlyOwner 
    {
        _baseURIValue = baseURI;
    }

    function _baseURI() internal view override returns (string memory) {
        return _baseURIValue;
    }

    function _burn(uint256 tokenId) 
        internal 
        override(ERC721URIStorage) 
    {
        super._burn(tokenId);
    }

    function tokenURI(uint256 tokenId)
        public
        view
        override(ERC721URIStorage)
        returns (string memory)
    {
        return super.tokenURI(tokenId);
    }

    function supportsInterface(bytes4 interfaceId)
        public
        view
        override(ERC721URIStorage)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }
}
