import { ethers } from 'ethers'
import { useEffect, useState } from 'react'
import axios from 'axios'
import Web3Modal from 'web3modal'
import { useRouter } from 'next/router'

import {
  platformAddress
} from '../config'

import MessagingPlatform from '../artifacts/contracts/messagingPlatform.sol/MessagingPlatform.json'

export default function MyAssets() {
  const [nfts, setNfts] = useState([])
  const [loadingState, setLoadingState] = useState('not-loaded')
  const router = useRouter()
  useEffect(() => {
    loadNFTs()
  }, [])
  async function loadNFTs() {
    const web3Modal = new Web3Modal({
      network: "mainnet",
      cacheProvider: true,
    })
    const connection = await web3Modal.connect()
    const provider = new ethers.providers.Web3Provider(connection)
    const signer = provider.getSigner()

    const marketplaceContract = new ethers.Contract(platformAddress, MessagingPlatform.abi, signer)
    const data = await marketplaceContract.fetchSentMessages()
    console.log(data)
    const items = await Promise.all(data.map(async i => {
      const tokenURI = await marketplaceContract.tokenURI(i.messageId)
      const validTokenURI = tokenURI.replace("https://ipfs.infura.io/ipfs/", "https://ipfs.io/ipfs/")
      const meta = await axios.get(validTokenURI)
      console.log(meta)
      let item = {
        messageId: i.messageId.toNumber(),
        sender: i.sender,
        receiver: i.receiver,
        message: meta.data.message,
        fileLink: meta.data.file
        // fileUrl: i.fileUrl,
        // tokenURI
      }
      return item
    }))
    setNfts(items)
    setLoadingState('loaded') 
  }
  if (loadingState === 'loaded' && !nfts.length) return (<h1 className="py-10 px-20 text-3xl">No messages sent.</h1>)
  return (
    <div className="flex justify-center">
      <div className="p-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-2 pt-2">
          {
            nfts.map((nft, i) => (
              <div key={i} className="border shadow rounded-xl overflow-hidden">
                {/* <img src={nft.image} className="rounded" /> */}
                <div className="p-4 bg-black">
                  <p className="text-2xl font-bold text-white">{nft.message}</p>
                  <p className="text-xs font-bold text-white">From: {nft.sender}</p>
                  <p className="text-xs font-bold text-white">To: {nft.receiver}</p>
                  {nft.fileLink ?
                  <p className="text-xs font-bold text-white">Attachements: <a href={nft.fileLink.replace(".infura","")}>Click here</a></p>
                : <p className="text-xs font-bold text-white">No Attachements</p>}
                </div>
              </div>
            ))
          }
        </div>
      </div>
    </div>
  )
}