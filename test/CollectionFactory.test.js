const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("CollectionFactory", function () {
  let CollectionFactory;
  let collectionFactory;
  let owner;
  let addr1;
  let addr2;

  beforeEach(async function () {
    [owner, addr1, addr2] = await ethers.getSigners();
    
    CollectionFactory = await ethers.getContractFactory("CollectionFactory");
    collectionFactory = await CollectionFactory.deploy();
    await collectionFactory.waitForDeployment();
  });

  describe("Collection Creation", function () {
    it("Should create a new collection", async function () {
      const tx = await collectionFactory.createCollection(
        "Test Collection",
        "TEST",
        "https://api.example.com/token/"
      );

      const receipt = await tx.wait();
      const event = receipt.logs.find(
        x => x.fragment && x.fragment.name === 'CollectionCreated'
      );
      expect(event).to.not.be.undefined;

      const collections = await collectionFactory.getCollectionsByOwner(owner.address);
      expect(collections.length).to.equal(1);
    });

    it("Should allow multiple users to create collections", async function () {
      await collectionFactory.connect(addr1).createCollection(
        "Collection 1",
        "COL1",
        "https://api.example.com/token/"
      );

      await collectionFactory.connect(addr2).createCollection(
        "Collection 2",
        "COL2",
        "https://api.example.com/token/"
      );

      const collections1 = await collectionFactory.getCollectionsByOwner(addr1.address);
      const collections2 = await collectionFactory.getCollectionsByOwner(addr2.address);

      expect(collections1.length).to.equal(1);
      expect(collections2.length).to.equal(1);
    });
  });

  describe("Collection Queries", function () {
    it("Should return all collections", async function () {
      await collectionFactory.createCollection("Col1", "COL1", "https://api.example.com/token/");
      await collectionFactory.connect(addr1).createCollection("Col2", "COL2", "https://api.example.com/token/");

      const allCollections = await collectionFactory.getAllCollections();
      expect(allCollections.length).to.equal(2);
    });
  });
}); 