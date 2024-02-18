import { ethers } from "hardhat";

async function main() {
  let usdt = await ethers.deployContract("Token", ["USDT", "USDT"]);
  await usdt.waitForDeployment();
  console.log(await usdt.getAddress());

  let usdc = await ethers.deployContract("Token", ["USDC", "USDC"]);
  await usdc.waitForDeployment();
  console.log(await usdc.getAddress());
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {});
