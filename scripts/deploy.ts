import { network } from "hardhat";

const { ethers } = await network.connect();

async function main() {
  const BlockFarm = await ethers.getContractFactory("BlockFarm");

  const blockFarm = await BlockFarm.deploy();

  await blockFarm.waitForDeployment();

  console.log(
    "BlockFarm deployed to:",
    await blockFarm.getAddress()
  );
}

main().catch((error) => {
  console.error(error);
});