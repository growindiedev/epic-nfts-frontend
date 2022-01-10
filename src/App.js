import "./styles/App.css";
import twitterLogo from "./assets/twitter-logo.svg";
import React, { useEffect, useState } from "react";
import myEpicNft from "./utils/myEpicNft.json";
import { ethers } from "ethers";

// Constants
const TWITTER_HANDLE = "jarryingnut";
const TWITTER_LINK = `https://twitter.com/${TWITTER_HANDLE}`;
const OPENSEA_LINK = "";
const TOTAL_MINT_COUNT = 50;

const App = () => {
  const [currentAccount, setCurrentAccount] = useState("");
  const [openSeaLink, setOpenSeaLink] = useState(null);
  const [buttonText, setButtonText] = useState("Mint NFT");
  const [success, setSuccess] = useState(false);

  const CONTRACT_ADDRESS = "0xD0274542B92664F1316863C3e2D0DE9aEC9F3B6B";

  const checkChainId = async (ethereum) => {
    let chainId = await ethereum.request({ method: "eth_chainId" });
    console.log("Connected to chain " + chainId);
    const rinkebyChainId = "0x4";

    if (chainId !== rinkebyChainId) {
      alert("You are not connected to the Rinkeby Test Network!");
      return;
    }
    return;
  };

  const checkIfWalletIsConnected = async () => {
    const { ethereum } = window;
    if (!ethereum) {
      return;
    } else {
      console.log("We have the ethereum object", ethereum);
    }

    const accounts = await ethereum.request({ method: "eth_accounts" });

    if (accounts.length !== 0) {
      const account = accounts[0];
      checkChainId(ethereum);
      console.log("Found an authorized account:", account);
      setCurrentAccount(account);
      setupEventListener();
    } else {
      console.log("No authorized account found");
    }
  };

  const connectWallet = async () => {
    const { ethereum } = window;

    try {
      //const { ethereum } = window;
      if (!ethereum) {
        alert("Get MetaMask!");
        return;
      }
      checkChainId(ethereum);
      const accounts = await ethereum.request({
        method: "eth_requestAccounts",
      });

      console.log("Connected", accounts[0]);
      setCurrentAccount(accounts[0]);
      setupEventListener();
    } catch (error) {
      console.log(error);
    }
  };

  const setupEventListener = async () => {
    try {
      const { ethereum } = window;
      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const connectedContract = new ethers.Contract(
          CONTRACT_ADDRESS,
          myEpicNft.abi,
          signer
        );
        connectedContract.on("NewEpicNFTMinted", (from, tokenId) => {
          console.log(from, tokenId.toNumber());
          alert(
            `Hey there! We've minted your NFT and sent it to your wallet. It may be blank right now. It can take a max of 10 min to show up on OpenSea. Here's the link: https://testnets.opensea.io/assets/${CONTRACT_ADDRESS}/${tokenId.toNumber()}`
          );
          setOpenSeaLink(
            `https://testnets.opensea.io/assets/${CONTRACT_ADDRESS}/${tokenId.toNumber()}`
          );
        });
        console.log("Setup event listener!");
      } else {
        console.log("Ethereum object doesn't exist!");
      }
    } catch (error) {
      console.log(error);
    }
  };

  const askContractToMintNft = async () => {
    try {
      const { ethereum } = window;
      setSuccess(false);
      if (ethereum) {
        checkChainId(ethereum);
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const connectedContract = new ethers.Contract(
          CONTRACT_ADDRESS,
          myEpicNft.abi,
          signer
        );

        console.log("Going to pop wallet now to pay gas...");
        let nftTxn = await connectedContract.makeAnEpicNFT();

        console.log("Mining...please wait.");
        setButtonText("Minting...");
        await nftTxn.wait();
        setSuccess(true);
        setButtonText("Mint NFT");
        console.log(
          `Mined, see transaction: https://rinkeby.etherscan.io/tx/${nftTxn.hash}`
        );
      } else {
        console.log("Ethereum object doesn't exist!");
        setButtonText("Mint NFT");
      }
    } catch (error) {
      console.log(error);
      setButtonText("❤️‍🩹 Failed! Mint again");
    }
  };

  const renderNotConnectedContainer = () => (
    <button
      onClick={connectWallet}
      className="cta-button connect-wallet-button"
    >
      Connect to Wallet
    </button>
  );

  useEffect(() => {
    checkIfWalletIsConnected();
  }, []);

  return (
    <div className="App">
      <div className="container">
        <div className="header-container">
          <p className="header gradient-text">Jarryingnut's NFT Collection</p>
          <p className="sub-text">
            Each beautiful. Each unique. Discover your NFT today.
          </p>
          {currentAccount === "" ? (
            renderNotConnectedContainer()
          ) : (
            <>
              <button
                disabled={buttonText === "Minting..."}
                onClick={askContractToMintNft}
                className="cta-button connect-wallet-button"
              >
                {buttonText}
              </button>
              {success && (
                <a href={openSeaLink} target="_blank">
                  <button className="cta-button connect-wallet-button ">
                    See your NFT's
                  </button>
                </a>
              )}
            </>
          )}
        </div>
        <div className="footer-container">
          <img alt="Twitter Logo" className="twitter-logo" src={twitterLogo} />
          <a
            className="footer-text"
            href={TWITTER_LINK}
            target="_blank"
            rel="noreferrer"
          >{`built by @${TWITTER_HANDLE}`}</a>
        </div>
      </div>
    </div>
  );
};

export default App;
