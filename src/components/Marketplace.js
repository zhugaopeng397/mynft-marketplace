import Navbar from "./Navbar";
import NFTTile from "./NFTTile";
import MarketplaceJSON from "../Marketplace.json";
import axios from "axios";
import { useState } from "react";


const ownerAddr = process.env.REACT_APP_OWNER_ADDRESS;
const contractAddr = process.env.REACT_APP_CONTRACT_ADDRESS;
const alchemyApiKey = process.env.REACT_APP_ALCHEMY_API_KEY;

export default function Marketplace() {
const sampleData = [
    {
        "name": "NFT#1",
        "description": "Alchemy's First NFT",
        "website":"http://axieinfinity.io",
        "image":"https://gateway.pinata.cloud/ipfs/QmTsRJX7r5gyubjkdmzFrKQhHv74p5wT9LdeF1m3RTqrE5",
        "price":"0.03ETH",
        "currentlySelling":"True",
        "address":"0xe81Bf5A757CB4f7F82a2F23b1e59bE45c33c5b13",
    },
    {
        "name": "NFT#2",
        "description": "Alchemy's Second NFT",
        "website":"http://axieinfinity.io",
        "image":"https://gateway.pinata.cloud/ipfs/QmdhoL9K8my2vi3fej97foiqGmJ389SMs55oC5EdkrxF2M",
        "price":"0.03ETH",
        "currentlySelling":"True",
        "address":"0xe81Bf5A757C4f7F82a2F23b1e59bE45c33c5b13",
    },
    {
        "name": "NFT#3",
        "description": "Alchemy's Third NFT",
        "website":"http://axieinfinity.io",
        "image":"https://gateway.pinata.cloud/ipfs/QmTsRJX7r5gyubjkdmzFrKQhHv74p5wT9LdeF1m3RTqrE5",
        "price":"0.03ETH",
        "currentlySelling":"True",
        "address":"0xe81Bf5A757C4f7F82a2F23b1e59bE45c33c5b13",
    },
];
const [data, updateData] = useState([]);
const [dataFetched, updateFetched] = useState(false);
const { Network, Alchemy } = require('alchemy-sdk');
const settings = {
    apiKey: alchemyApiKey, // Replace with your Alchemy API Key.
    network: Network.ETH_GOERLI, // Replace with your network.
};
const alchemy = new Alchemy(settings);

async function getAllNFTsWithAPI() {
    // Flag to omit metadata
    const omitMetadata = false;
    // Get all NFTs
    const items = await alchemy.nft.getNftsForContract(contractAddr, {
        omitMetadata: omitMetadata,
    }).then((res) => {
        console.log("res=",res);
        return res.nfts.map(i => {
            // let nftOwner = alchemy.nft.getOwnersForNft(contractAddr, i.tokenId).then((r) => {
            //     console.log("r",r.owners[0]);
            //     seller = r.owners[0];
            // });
            let item = {
                tokenId: i.tokenId,
                // seller: seller,
                // owner: nftOwner,
                price: i.rawMetadata.price,
                image: i.rawMetadata.image,
                name: i.rawMetadata.name,
                description: i.rawMetadata.description
            }
            return item;
        })
    });
    console.log("items",items);

    updateFetched(true);
    updateData(items);
}

async function getAllNFTs() {
    const ethers = require("ethers");
    //After adding your Hardhat network to your metamask, this code will get providers and signers
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner();
    //Pull the deployed contract instance
    let contract = new ethers.Contract(MarketplaceJSON.address, MarketplaceJSON.abi, signer);
    //create an NFT Token
    let transaction = await contract.getAllNFTs();
    console.log("transaction",transaction);
    //Fetch all the details of every NFT from the contract and display
    const items = await Promise.all(transaction.map(async i => {
        const tokenURI = await contract.tokenURI(i.tokenId);
        let meta = await axios.get(tokenURI);
        meta = meta.data;

        let price = ethers.utils.formatUnits(i.price.toString(), 'ether');
        let item = {
            price,
            tokenId: i.tokenId.toNumber(),
            seller: i.seller,
            owner: i.owner,
            image: meta.image,
            name: meta.name,
            description: meta.description,
        }
        return item;
    }))

    updateFetched(true);
    updateData(items);
}

if(!dataFetched)
    getAllNFTsWithAPI();

return (
    <div>
        <Navbar></Navbar>
        <div className="flex flex-col place-items-center mt-20">
            <div className="md:text-xl font-bold text-white">
                Top NFTs
            </div>
            <div className="flex mt-5 justify-between flex-wrap max-w-screen-xl text-center">
                {data.map((value, index) => {
                    return <NFTTile data={value} key={index}></NFTTile>;
                })}
            </div>
        </div>            
    </div>
);

}