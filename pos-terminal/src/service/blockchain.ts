import { Wallet, ethers, formatEther } from "ethers";
import { vaultFactoryAbi } from "../abi/VaultFactory";
import { vaultAbi } from "../abi/Vault";
import { poSTerminalAbi } from "../abi/PoSTerminal";
import { routerAbi } from "../abi/Router";
import { erc20abi } from "../abi/erc20";
import { Chains, chainConfig } from "../constants";

const WALLET =
  "0xff4f55382dc1dad042411e64cf13eafaa051e78c9f343a3ffab8ce2408b74479";

export const sendTransaction = async (
  chain: Chains,
  cardPrivateKey: string
) => {
  const chainDetail = chainConfig[chain];
  const provider = new ethers.JsonRpcProvider(chainDetail.rpc);
  const amount = ethers.parseEther("10");

  const signer = new ethers.Wallet(
    process.env.REACT_APP_POS_CONTRACT_OWNER!,
    provider
  );

  const hashedTransferCallData = ethers.getBytes(
    ethers.solidityPackedKeccak256(
      ["address", "uint256"],
      [chainDetail.usdc, amount]
    )
  );
  const wallet = new Wallet(cardPrivateKey);
  const signature = wallet.signMessage(hashedTransferCallData);

  const posTerminalContract = await getPoSTerminal(
    chainDetail.posTerminal,
    signer
  );
  const routerTerminalContract = getRouter(chain);

  const secondCall = (
    await routerTerminalContract
      .getFunction("swapExactTokensForTokens")
      .populateTransaction(
        amount,
        1,
        [chainDetail.usdc, chainDetail.usdt],
        chainDetail.posTerminal,
        new Date().getTime() + 60 * 60 * 24 * 7
      )
  ).data;

  const vaultAddress = await getVaultFactory(signer, chain).vaults(
    signer.getAddress()
  );
  console.log("vaultAddress", vaultAddress);

  const tx = await posTerminalContract.transferAndCall(
    vaultAddress,
    chainDetail.usdc,
    amount,
    signature,
    await routerTerminalContract.getAddress(),
    secondCall
  );
  const receipt = await tx.wait();
  return receipt.hash;
};

export const getVaultFactory = (
  runner: ethers.ContractRunner,
  chain: Chains
) => {
  const chainDetails = chainConfig[chain];
  return new ethers.Contract(
    chainDetails.vaultFactory,
    vaultFactoryAbi,
    runner
  );
};

export const getVault = (runner: ethers.ContractRunner, address: string) => {
  return new ethers.Contract(address, vaultAbi, runner);
};

export const getPoSTerminal = (
  address: string,
  runner: ethers.ContractRunner
) => {
  return new ethers.Contract(address, poSTerminalAbi, runner);
};

export const getErc20 = (address: string, runner: ethers.ContractRunner) => {
  return new ethers.Contract(address, erc20abi, runner);
};

export const getRouter = (chain: Chains) => {
  const chainDetails = chainConfig[chain];
  return new ethers.Contract(chainDetails.router, routerAbi);
};

export async function approvePoSTerminal(chains: Chains) {
  console.log("start call");
  const chainDetails = chainConfig[chains];

  const provider = new ethers.JsonRpcProvider(chainDetails.rpc);
  const signer = new ethers.Wallet(
    process.env.REACT_APP_POS_CONTRACT_OWNER!,
    provider
  );

  const posTerminalContract = getPoSTerminal(chainDetails.posTerminal, signer);
  const token = getErc20(chainDetails.usdc, signer);

  const calldata = (
    await token
      .getFunction("approve")
      .populateTransaction(chainDetails.router, ethers.MaxUint256)
  ).data;

  const txn = await posTerminalContract.call(
    await token.getAddress(),
    calldata
  );
  const receipt = await txn.wait();
  console.log(receipt);
  return receipt.hash;
}

export async function approveKey(chains: Chains) {
  const chainDetails = chainConfig[chains];
  const provider = new ethers.JsonRpcProvider(chainDetails.rpc);
  const signer = new ethers.Wallet(
    process.env.REACT_APP_POS_CONTRACT_OWNER!,
    provider
  );

  const vaultAddress = await getVaultFactory(signer, chains).vaults(
    signer.getAddress()
  );
  console.log(vaultAddress);

  const vaultContract = getVault(signer, vaultAddress);
  const wallet = new Wallet(WALLET);

  const txn = await vaultContract.updateKey(wallet.getAddress());
  const rp = await txn.wait();
  return rp.hash;
}

export async function getTokenBalance(
  chains: Chains,
  token: string,
  address: string
): Promise<string> {
  const chainDetails = chainConfig[chains];

  const provider = new ethers.JsonRpcProvider(chainDetails.rpc);

  const erc20 = getErc20(token, provider);

  const balance = await erc20.balanceOf(address);

  return formatEther(balance);
}
