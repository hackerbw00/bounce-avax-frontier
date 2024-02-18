export const chainConfig = {
  Avax: {
    name: "Avalanche",
    vault: "0x8fbD84BB0f621d23A8B5D9CD630dA2CAA793a4D4",
    vaultFactory: "0x1482B1D35C939CA6a2D5869eB0CEcB295737DA3D",
    posTerminal: "0x4543C34e15Ac96DaB7807213ff206bde3505B981",
    rpc: "https://api.avax-test.network/ext/bc/C/rpc",
    usdc: "0xe0eD866C5796100534da7F98979377e211570F8f", // TODO:
    usdt: "0xF732fa7a9F911517ef9454875928FA41C732af56", // TODO:
    router: "0xEc9834645630683C824c6CfE2475C1fE67e5931c", // TODO:
    blockExplorer: "https://testnet.snowtrace.io/tx/",
  },
} as Record<
  "Avax",
  {
    name: string;
    rpc: string;
    usdc: string;
    usdt: string;
    vault: string;
    vaultFactory: string;
    router: string;
    posTerminal: string;
    blockExplorer: string;
  }
>;

export type Chains = keyof typeof chainConfig;
