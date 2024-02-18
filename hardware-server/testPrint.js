const print = require("./print");

async function start() {
  await print({
    from: "0x7AE2F5B9e386cd1B50A4550696D957cB4900f03a",
    vault: "0xCac410CD44717311F63aAf6081CB07244F10844f",
    posTerminal: "0x974637Fd04eB663E6E21E7eBc8e410cE4210fb52",
    fromAmount: "10",
    fromToken: "USDC",
    action: "Uniswap Swap from USDC to USDT",
    qrCode:
      "https://bscscan.com/tx/0x453cc180ea0f1ad59ddf0ec108702d0ac18ed4f2fdc965247dbb98f35ce2974f",
    chain: "BSC",
  });
}

start();
