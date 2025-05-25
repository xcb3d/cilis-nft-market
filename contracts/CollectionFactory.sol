// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "./interfaces/ICollectionFactory.sol";
import "./NFTCollection.sol";

contract CollectionFactory is ICollectionFactory, Ownable {
    // Mapping from owner to their collections
    mapping(address => address[]) private _ownerCollections;
    // Array of all collections
    address[] private _allCollections;

    constructor() Ownable() {}

    function createCollection(
        string memory name,
        string memory symbol,
        string memory baseURI,
        string memory urlMetadata
    ) external returns (address) {
        NFTCollection newCollection = new NFTCollection(
            name,
            symbol,
            msg.sender,
            baseURI,
            urlMetadata
        );
        
        address collectionAddress = address(newCollection);
        
        _ownerCollections[msg.sender].push(collectionAddress);
        _allCollections.push(collectionAddress);
        
        emit CollectionCreated(
            collectionAddress,
            msg.sender,
            name,
            symbol,
            urlMetadata
        );
        
        return collectionAddress;
    }

    function getCollectionsByOwner(address owner) 
        external 
        view 
        returns (address[] memory) 
    {
        return _ownerCollections[owner];
    }

    function getAllCollections() 
        external 
        view 
        returns (address[] memory) 
    {
        return _allCollections;
    }
}
