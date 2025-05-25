const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("NFTCollection", function () {
  let NFTCollection;
  let nftCollection;
  let owner;
  let addr1;
  let addr2;

  beforeEach(async function () {
    [owner, addr1, addr2] = await ethers.getSigners();
    
    NFTCollection = await ethers.getContractFactory("NFTCollection");
    nftCollection = await NFTCollection.deploy(
      "Test Collection",
      "TEST",
      owner.address,
      "https://api.example.com/token/"
    );
    await nftCollection.waitForDeployment();
  });

  describe("Minting", function () {
    it("Should allow owner to mint NFT", async function () {
      const tx = await nftCollection.mint("1.json");
      const receipt = await tx.wait();
      
      const event = receipt.logs.find(
        x => x.fragment && x.fragment.name === 'NFTMinted'
      );
      expect(event).to.not.be.undefined;
      
      const tokenURI = await nftCollection.tokenURI(1);
      expect(tokenURI).to.equal("https://api.example.com/token/1.json");
    });

    it("Should not allow non-owner to mint", async function () {
      await expect(
        nftCollection.connect(addr1).mint("1.json")
      ).to.be.revertedWith("Ownable: caller is not the owner");
    });
  });

  describe("Collection Info", function () {
    it("Should return correct collection info", async function () {
      const info = await nftCollection.getCollectionInfo();
      expect(info[0]).to.equal("Test Collection"); // name
      expect(info[1]).to.equal("TEST"); // symbol
      expect(info[2]).to.equal(owner.address); // owner
      expect(info[3]).to.equal(0n); // totalSupply
    });
  });
}); 