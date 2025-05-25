const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("Marketplace", function () {
  let NFTCollection;
  let nftCollection;
  let Marketplace;
  let marketplace;
  let owner;
  let seller;
  let buyer;

  beforeEach(async function () {
    [owner, seller, buyer] = await ethers.getSigners();
    
    // Deploy NFT Collection
    NFTCollection = await ethers.getContractFactory("NFTCollection");
    nftCollection = await NFTCollection.deploy(
      "Test Collection",
      "TEST",
      seller.address,
      "https://api.example.com/token/"
    );
    await nftCollection.waitForDeployment();

    // Deploy Marketplace
    Marketplace = await ethers.getContractFactory("Marketplace");
    marketplace = await Marketplace.deploy();
    await marketplace.waitForDeployment();

    // Mint NFT for seller
    await nftCollection.connect(seller).mint("1.json");
  });

  describe("Listing", function () {
    it("Should list NFT for sale", async function () {
      // Approve marketplace
      await nftCollection.connect(seller).approve(await marketplace.getAddress(), 1);

      await expect(
        marketplace.connect(seller).listNFT(
          await nftCollection.getAddress(),
          1,
          ethers.parseEther("1.0")
        )
      ).to.emit(marketplace, "NFTListed").withArgs(
        1, // listingId
        await nftCollection.getAddress(),
        1, // tokenId
        seller.address,
        ethers.parseEther("1.0")
      );
    });

    it("Should fail when listing without approval", async function () {
      await expect(
        marketplace.connect(seller).listNFT(
          await nftCollection.getAddress(),
          1,
          ethers.parseEther("1.0")
        )
      ).to.be.revertedWith("Marketplace not approved");
    });

    it("Should fail when listing with zero price", async function () {
      await nftCollection.connect(seller).approve(await marketplace.getAddress(), 1);
      await expect(
        marketplace.connect(seller).listNFT(
          await nftCollection.getAddress(),
          1,
          0
        )
      ).to.be.revertedWith("Price must be greater than 0");
    });

    it("Should fail when listing someone else's NFT", async function () {
      await nftCollection.connect(seller).approve(await marketplace.getAddress(), 1);
      await expect(
        marketplace.connect(buyer).listNFT(
          await nftCollection.getAddress(),
          1,
          ethers.parseEther("1.0")
        )
      ).to.be.revertedWith("Not token owner");
    });
  });

  describe("Listing Management", function () {
    beforeEach(async function () {
      await nftCollection.connect(seller).approve(await marketplace.getAddress(), 1);
      await marketplace.connect(seller).listNFT(
        await nftCollection.getAddress(),
        1,
        ethers.parseEther("1.0")
      );
    });

    it("Should allow seller to cancel listing", async function () {
      await expect(
        marketplace.connect(seller).cancelListing(1)
      ).to.emit(marketplace, "ListingCanceled")
        .withArgs(1, await nftCollection.getAddress(), 1);

      // Verify listing is no longer active
      const listing = await marketplace.getListing(1);
      expect(listing.isActive).to.be.false;
    });

    it("Should not allow non-seller to cancel listing", async function () {
      await expect(
        marketplace.connect(buyer).cancelListing(1)
      ).to.be.revertedWith("Not seller");
    });

    it("Should allow seller to update price", async function () {
      const newPrice = ethers.parseEther("2.0");
      await expect(
        marketplace.connect(seller).updatePrice(1, newPrice)
      ).to.emit(marketplace, "PriceUpdated")
        .withArgs(1, newPrice);

      const listing = await marketplace.getListing(1);
      expect(listing.price).to.equal(newPrice);
    });

    it("Should not allow updating price to zero", async function () {
      await expect(
        marketplace.connect(seller).updatePrice(1, 0)
      ).to.be.revertedWith("Price must be greater than 0");
    });

    it("Should not allow non-seller to update price", async function () {
      await expect(
        marketplace.connect(buyer).updatePrice(1, ethers.parseEther("2.0"))
      ).to.be.revertedWith("Not seller");
    });
  });

  describe("Buying", function () {
    beforeEach(async function () {
      await nftCollection.connect(seller).approve(await marketplace.getAddress(), 1);
      await marketplace.connect(seller).listNFT(
        await nftCollection.getAddress(),
        1,
        ethers.parseEther("1.0")
      );
    });

    it("Should allow buying NFT", async function () {
      await expect(
        marketplace.connect(buyer).buyNFT(1, {
          value: ethers.parseEther("1.0")
        })
      ).to.emit(marketplace, "NFTSold").withArgs(
        1, // listingId
        await nftCollection.getAddress(),
        1, // tokenId
        seller.address,
        buyer.address,
        ethers.parseEther("1.0")
      );

      const newOwner = await nftCollection.ownerOf(1);
      expect(newOwner).to.equal(buyer.address);
    });

    it("Should fail when trying to buy with insufficient funds", async function () {
      await expect(
        marketplace.connect(buyer).buyNFT(1, {
          value: ethers.parseEther("0.5")
        })
      ).to.be.revertedWith("Insufficient payment");
    });

    it("Should fail when trying to buy non-existent listing", async function () {
      await expect(
        marketplace.connect(buyer).buyNFT(999, {
          value: ethers.parseEther("1.0")
        })
      ).to.be.revertedWith("Listing not active");
    });

    it("Should fail when trying to buy canceled listing", async function () {
      await marketplace.connect(seller).cancelListing(1);
      await expect(
        marketplace.connect(buyer).buyNFT(1, {
          value: ethers.parseEther("1.0")
        })
      ).to.be.revertedWith("Listing not active");
    });

    it("Should fail when trying to buy already sold NFT", async function () {
      await marketplace.connect(buyer).buyNFT(1, {
        value: ethers.parseEther("1.0")
      });

      await expect(
        marketplace.connect(buyer).buyNFT(1, {
          value: ethers.parseEther("1.0")
        })
      ).to.be.revertedWith("Listing not active");
    });

    it("Should transfer correct amount to seller and platform", async function () {
      const platformFee = ethers.parseEther("1.0") * 250n / 10000n; // 2.5%
      const sellerAmount = ethers.parseEther("1.0") - platformFee;

      const sellerBalanceBefore = await ethers.provider.getBalance(seller.address);
      const platformBalanceBefore = await ethers.provider.getBalance(await marketplace.getAddress());

      await marketplace.connect(buyer).buyNFT(1, {
        value: ethers.parseEther("1.0")
      });

      const sellerBalanceAfter = await ethers.provider.getBalance(seller.address);
      const platformBalanceAfter = await ethers.provider.getBalance(await marketplace.getAddress());

      expect(sellerBalanceAfter - sellerBalanceBefore).to.equal(sellerAmount);
      expect(platformBalanceAfter - platformBalanceBefore).to.equal(platformFee);
    });
  });

  describe("Platform Fee Management", function () {
    it("Should allow owner to withdraw platform fees", async function () {
      // First make a sale to generate platform fees
      await nftCollection.connect(seller).approve(await marketplace.getAddress(), 1);
      await marketplace.connect(seller).listNFT(
        await nftCollection.getAddress(),
        1,
        ethers.parseEther("1.0")
      );
      await marketplace.connect(buyer).buyNFT(1, {
        value: ethers.parseEther("1.0")
      });

      const platformBalance = await ethers.provider.getBalance(await marketplace.getAddress());
      const ownerBalanceBefore = await ethers.provider.getBalance(owner.address);

      await marketplace.connect(owner).withdrawFees();

      const ownerBalanceAfter = await ethers.provider.getBalance(owner.address);
      const marketplaceBalanceAfter = await ethers.provider.getBalance(await marketplace.getAddress());

      expect(marketplaceBalanceAfter).to.equal(0);
      expect(ownerBalanceAfter).to.be.gt(ownerBalanceBefore);
    });

    it("Should not allow non-owner to withdraw fees", async function () {
      await expect(
        marketplace.connect(buyer).withdrawFees()
      ).to.be.revertedWith("Ownable: caller is not the owner");
    });
  });
}); 