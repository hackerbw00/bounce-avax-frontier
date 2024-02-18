import { useEffect, useState } from "react";
import "./App.css";
import {
  approveKey,
  approvePoSTerminal,
  getTokenBalance,
  sendTransaction,
} from "./service/blockchain";
import QRCode from "react-qr-code";
import { Chains, chainConfig } from "./constants";

const socket = new WebSocket("ws://localhost:4000/");

function App() {
  const [chain, setChain] = useState<Chains>("Avax");
  const [cardDetails, setCardDetails] = useState<[string, string]>();
  const [hash, setHash] = useState();
  const [hash2, setHash2] = useState();
  const [loading, setLoading] = useState(false);
  const [auto, setAuto] = useState(false);
  const [usdcBalance, setUsdcBalance] = useState(0);
  const [usdtBalance, setUsdtBalance] = useState(0);

  const [usdcVaultBalance, setUsdcVaultBalance] = useState(0);
  const [usdtVaultBalance, setUsdtVaultBalance] = useState(0);
  const [tab, setTab] = useState(0);

  const chainDetails = chainConfig[chain];

  async function listen() {
    socket.onopen = function (e) {
      console.log("[open] Connection established");
    };
    socket.onmessage = function (event) {
      const { privateKey, ownerAddress } = JSON.parse(event.data);
      console.log("client received", privateKey, ownerAddress);
      setCardDetails([privateKey, ownerAddress]);
    };
  }

  async function printTxn(txnHash: string) {
    if (cardDetails?.[1]) {
      const data = JSON.stringify({
        from: cardDetails[1],
        vault: chainDetails.vault,
        posTerminal: chainDetails.posTerminal,
        fromAmount: 10,
        fromToken: "USDC",
        action: "Uniswap Swap from USDT to USDC",
        qrCode: chainDetails.blockExplorer + txnHash,
        chain: chainDetails.name,
      });
      socket.send(data);
    }
  }

  async function getTransactions() {
    setLoading(true);
    const usdcBalance = await getTokenBalance(
      chain,
      chainDetails.usdc,
      chainDetails.posTerminal
    );
    setUsdcBalance(Number(usdcBalance));

    const usdtBalance = await getTokenBalance(
      chain,
      chainDetails.usdt,
      chainDetails.posTerminal
    );
    setUsdtBalance(Number(usdtBalance));

    if (cardDetails?.[1]) {
      const usdcBalance = await getTokenBalance(
        chain,
        chainDetails.usdc,
        chainDetails.vault
      );
      setUsdcVaultBalance(Number(usdcBalance));

      const usdtBalance = await getTokenBalance(
        chain,
        chainDetails.usdt,
        chainDetails.vault
      );
      setUsdtVaultBalance(Number(usdtBalance));
    }
    setLoading(false);
  }

  useEffect(() => {
    listen();
    getTransactions();
    setCardDetails([
      "0xff4f55382dc1dad042411e64cf13eafaa051e78c9f343a3ffab8ce2408b74479",
      "0x1E117008E1a544Bbe12A2d178169136703430190",
    ]);
  }, [chain]);

  const transferAndSwap = async () => {
    (async () => {
      setLoading(true);
      setHash(undefined);
      setHash2(undefined);
      let hash;
      hash = await sendTransaction(chain, cardDetails?.[0] ?? "");
      setLoading(false);
      setHash(hash);
      printTxn(hash);
    })();
  };

  useEffect(() => {
    if (cardDetails?.[0] && auto) {
      console.log("attempt to send");
      transferAndSwap();
    }
  }, [cardDetails]);

  return (
    <div
      data-theme="light"
      className="flex min-h-screen justify-center items-center gap-4 bg-gradient-to-r from-purple-400 to-yellow-400"
    >
      <div className="card">
        <div role="tablist" className="tabs tabs-lifted">
          <input
            type="radio"
            name="my_tabs_2"
            role="tab"
            className="tab"
            aria-label="Pay"
            onClick={() => setTab(0)}
            checked={tab === 0}
          />
          <div
            role="tabpanel"
            className="tab-content bg-base-100 rounded-box w-96"
          >
            <div className="card-body justify-center">
              <h1 className="text-3xl font-bold">Bounce.</h1>
              <div className="inline-flex gap-1">
                <div className="dropdown dropdown-hover">
                  <label tabIndex={0} className="btn btn-sm">
                    {chain}
                  </label>
                  <ul
                    tabIndex={0}
                    className="dropdown-content z-[1] menu p-2 shadow bg-base-100 rounded-box w-52"
                  >
                    {
                      // @ts-ignore
                      Object.entries(chainConfig).map(([chain, value]) => (
                        <li key={chain}>
                          <button
                            onClick={() => {
                              setHash(undefined);
                              setChain(chain as Chains);
                            }}
                          >
                            {value.name}
                          </button>
                        </li>
                      ))
                    }
                  </ul>
                </div>
                <button
                  className="btn btn-sm"
                  onClick={() => {
                    setCardDetails(undefined);
                    setHash(undefined);
                    setHash2(undefined);
                    setLoading(false);
                  }}
                >
                  Clear
                </button>
                <input
                  type="checkbox"
                  className="toggle self-center ml-auto"
                  checked={auto}
                  onClick={() => setAuto((_auto) => !_auto)}
                />
              </div>
              <p className="text-sm">Paying 10 USDC and Swap USDT</p>
              {cardDetails ? (
                <p className="text-sm truncate">Owner: {cardDetails[1]}</p>
              ) : (
                <p className="text-sm">Waiting to scan card:</p>
              )}
              <div className="divider my-0"></div>
              {hash && (
                <p className="text-sm truncate">
                  hash:{" "}
                  <a
                    href={`${chainConfig[chain].blockExplorer}/${hash}`}
                    className="link link-primary"
                  >
                    {hash}
                  </a>
                </p>
              )}
              {hash2 && <p className="text-sm truncate">hash2: {hash2}</p>}
              {loading ? (
                <span className="loading loading-spinner loading-md self-center"></span>
              ) : (
                <>
                  <button
                    disabled={!cardDetails}
                    className="btn btn-sm"
                    onClick={transferAndSwap}
                  >
                    Pay & Swap
                  </button>
                  <button
                    disabled={!cardDetails}
                    className="btn btn-sm"
                    onClick={async () => {
                      setLoading(true);
                      setHash(undefined);
                      setHash2(undefined);
                      const hash = await approvePoSTerminal(chain);
                      setHash(hash);
                      setLoading(false);
                    }}
                  >
                    Approve Router
                  </button>
                  <button
                    className="btn btn-sm"
                    disabled={!cardDetails}
                    onClick={async () => {
                      setLoading(true);
                      setHash(undefined);
                      const hash = await approveKey(chain);
                      setHash(hash);
                      setLoading(false);
                    }}
                  >
                    Reset Card address
                  </button>
                  <button
                    className="btn btn-sm"
                    onClick={async () => {
                      printTxn("hello-world");
                    }}
                  >
                    Test Print
                  </button>
                </>
              )}
            </div>
          </div>

          <input
            type="radio"
            name="my_tabs_2"
            role="tab"
            className="tab"
            aria-label="Details"
            onClick={() => setTab(1)}
            checked={tab === 1}
          />
          <div
            role="tabpanel"
            className="tab-content bg-base-100 rounded-box w-96"
          >
            <div className="card-body justify-center">
              <div className="inline-flex gap-1">
                <div className="dropdown dropdown-hover">
                  <label tabIndex={0} className="btn btn-sm">
                    {chain}
                  </label>
                  <ul
                    tabIndex={0}
                    className="dropdown-content z-[1] menu p-2 shadow bg-base-100 rounded-box w-52"
                  >
                    {
                      // @ts-ignore
                      Object.entries(chainConfig).map(([chain, value]) => (
                        <li key={chain}>
                          <button
                            onClick={() => {
                              setHash(undefined);
                              setChain(chain as Chains);
                            }}
                          >
                            {value.name}
                          </button>
                        </li>
                      ))
                    }
                  </ul>
                </div>
                <button
                  className="btn btn-sm"
                  onClick={() => {
                    getTransactions();
                  }}
                >
                  refresh
                </button>
              </div>

              <div className="divider my-0"></div>
              {hash && (
                <p className="text-sm truncate">
                  hash:{" "}
                  <a
                    href={`${chainConfig[chain].blockExplorer}/${hash}`}
                    className="link link-primary"
                  >
                    {hash}
                  </a>
                </p>
              )}
              {loading ? (
                <span className="loading loading-spinner loading-md self-center"></span>
              ) : (
                <>
                  <p className="text-sm truncate">
                    PoS: {chainDetails.posTerminal}
                  </p>
                  <p className="text-sm truncate">USDC: {usdcBalance}</p>
                  <p className="text-sm truncate">USDT: {usdtBalance}</p>
                  <div className="divider my-0"></div>

                  <p className="text-sm truncate">
                    Vault: {chainDetails.vault}
                  </p>
                  <p className="text-sm truncate">USDC: {usdcVaultBalance}</p>
                  <p className="text-sm truncate">USDT: {usdtVaultBalance}</p>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {(hash || hash2) && (
        <div className="card bg-base-100 shadow-xl">
          {hash && (
            <div className="card-body">
              <QRCode
                size={50}
                style={{ height: "auto", maxWidth: 100, width: 100 }}
                value={chainConfig[chain].blockExplorer + hash}
                viewBox={`0 0 256 256`}
              />
            </div>
          )}
          {hash2 && (
            <div className="card-body">
              <QRCode
                size={50}
                style={{ height: "auto", maxWidth: 100, width: 100 }}
                value={chainConfig[chain].blockExplorer + hash2}
                viewBox={`0 0 256 256`}
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default App;
