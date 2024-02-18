import { ethers } from "hardhat";

async function main() {
  const [owner] = await ethers.getSigners();

  // Deploy PoSTerminal
  const posTerminal = await ethers.getContractAt(
    "PoSTerminal",
    "0x7034baF34acA066DE42eae69E16FFADaa6e6750e"
  );
  console.log("posTerminal", await posTerminal.getAddress());

  // Check terminal
  const balance = await posTerminal.getFeeBalance();
  console.log(balance);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
