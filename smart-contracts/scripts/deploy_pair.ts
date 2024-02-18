import { ethers } from "hardhat";
import { uniswapV2FactoryAbi } from "../abi/UniswapV2Factory";
import { uniswapV2RouterAbi } from "../abi/UniswapV2Router";

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log(deployer.address);

  const usdt = "0xCB87fcb41b60136ED2E414252AEE05b5dC539aB2";
  const usdc = "0xEc61D69964004EAa23Ab76c721824650B9276E0a";
  // let uniswapV2Factory = new ethers.Contract(
  //   "0x9fBFa493EC98694256D171171487B9D47D849Ba9",
  //   uniswapV2FactoryAbi,
  //   deployer
  // );
  let uniswapV2Router = new ethers.Contract(
    "0x5951479fE3235b689E392E9BC6E968CE10637A52",
    uniswapV2RouterAbi,
    deployer
  );

  // const tx = await uniswapV2Factory.createPair(usdc, usdt, {
  //   gasLimit: 10_000_000,
  // });
  // await tx.wait();
  // console.log(tx);

  const tx = await uniswapV2Router.addLiquidity(
    usdc,
    usdt,
    ethers.parseEther("10000000000"),
    ethers.parseEther("10000000000"),
    0n,
    0n,
    deployer.address,
    1734360277,
    {
      gasLimit: 10_000_000,
    }
  );
  await tx.wait();
  console.log(tx);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
});
