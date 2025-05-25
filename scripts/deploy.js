const hre = require("hardhat");

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("Deploying contracts with the account:", deployer.address);

  // Deploy CollectionFactory
  const CollectionFactory = await hre.ethers.getContractFactory("CollectionFactory");
  const collectionFactory = await CollectionFactory.deploy();
  await collectionFactory.waitForDeployment();
  console.log("CollectionFactory deployed to:", await collectionFactory.getAddress());

  // Deploy Marketplace
  const Marketplace = await hre.ethers.getContractFactory("Marketplace");
  const marketplace = await Marketplace.deploy();
  await marketplace.waitForDeployment();
  console.log("Marketplace deployed to:", await marketplace.getAddress());

  // Verify contracts on Etherscan (if not on localhost)
  if (network.name !== "hardhat" && network.name !== "localhost") {
    console.log("Waiting for block confirmations...");
    await collectionFactory.deployTransaction.wait(6);
    await marketplace.deployTransaction.wait(6);

    await hre.run("verify:verify", {
      address: await collectionFactory.getAddress(),
      constructorArguments: [],
    });

    await hre.run("verify:verify", {
      address: await marketplace.getAddress(),
      constructorArguments: [],
    });
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  }); 