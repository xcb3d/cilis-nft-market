// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

interface ICollectionFactory {
    event CollectionCreated(
        address indexed collectionAddress,
        address indexed owner,
        string name,
        string symbol,
        string urlMetadata
    );

    function createCollection(
        string memory name,
        string memory symbol,
        string memory baseURI,
        string memory urlMetadata
    ) external returns (address);

    function getCollectionsByOwner(address owner) 
        external 
        view 
        returns (address[] memory);

    function getAllCollections() 
        external 
        view 
        returns (address[] memory);
}