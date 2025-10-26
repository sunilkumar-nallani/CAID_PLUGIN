const hre = require("hardhat");

async function main() {
  const ImageVerdictRegistry = await hre.ethers.getContractFactory("ImageVerdictRegistry");
  const registry = await ImageVerdictRegistry.deploy();

  await registry.deployed(); // Older method to wait for deployment
  const contractAddress = registry.address; // Older way to get the address
  
  console.log("ImageVerdictRegistry deployed to:", contractAddress);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });