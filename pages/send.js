import { useState } from 'react'
import { ethers } from 'ethers'
import { create as ipfsClient } from 'ipfs-http-client'
import { useRouter } from 'next/router'
import Web3Modal from 'web3modal'

const projectId = '2T3bXkQxGPQqvZMGvX3i08PaRnV';   // <---------- your Infura Project ID

const projectSecret = 'aa13894f887442f59d483d630635a735';  // <---------- your Infura Secret
// (for security concerns, consider saving these values in .env files)

const auth = 'Basic ' + Buffer.from(projectId + ':' + projectSecret).toString('base64');

const client = ipfsClient({
  host: 'ipfs.infura.io',
  port: 5001,
  protocol: 'https',
  headers: {
      authorization: auth,
  },
});


import {
  platformAddress
} from '../config'

import MessagingPlatform from '../artifacts/contracts/messagingPlatform.sol/MessagingPlatform.json'

export default function CreateItem() {
  const [fileUrl, setFileUrl] = useState(null)
  const [type, setType] = useState(null)
  
  const [formInput, updateFormInput] = useState({message: '', receiver: '' })
  const router = useRouter()

  async function onChange(e) {
    const file = e.target.files[0]
    try {
      const added = await client.add(
        file,
        {
          progress: (prog) => console.log(`received: ${prog}`)
        }
      )
      const url = `https://ipfs.infura.io/ipfs/${added.path}`
      setFileUrl(url)
      console.log(url)
    } catch (error) {
      console.log('Error uploading file: ', error)
    }  
  }
  async function uploadToIPFS() {
    let { message, receiver } = formInput
    if (!message) return
    if (receiver == "") {
      receiver = "0x0000000000000000000000000000000000000000"
    }

    /* first, upload to IPFS */
    const data = JSON.stringify({
      message, receiver, file: fileUrl
    })
    try {
      const added = await client.add(data)
      const url = `https://ipfs.infura.io/ipfs/${added.path}`
      /* after file is uploaded to IPFS, return the URL to use it in the transaction */
      console.log(url)
      return url
    } catch (error) {
      console.log('Error uploading file: ', error)
    }  
  }

  async function listNFTForSale() {
    const url = await uploadToIPFS()
    let { _, receiver } = formInput
    if (receiver == "") {
      receiver = "0x0000000000000000000000000000000000000000"
    }
    const web3Modal = new Web3Modal()
    const connection = await web3Modal.connect()
    const provider = new ethers.providers.Web3Provider(connection)
    const signer = provider.getSigner()
    console.log(url, receiver, type)
    /* next, create the item */
    let contract = new ethers.Contract(platformAddress, MessagingPlatform.abi, signer)
    console.log(url, receiver, type)
    let transaction = await contract.createMessage(url, receiver)
    await transaction.wait()
   
    router.push('/')
  }

  return (
    <div className="flex justify-center">
      <div className="w-1/2 flex flex-col pb-12">
          <div className="mt-8 flex items-center mb-4">
            <input type="radio" value="true" id="public" className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
              onChange={e => setType(e.target.value)} name="type" />
            <label className="ml-2 text-sm font-medium text-gray-900 dark:text-gray-300">Public</label>
          </div>
          <div className="flex items-center mb-4">
            <input type="radio" value="false" id="private" className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
              onChange={e => setType(e.target.value)} name="type"/>
            <label className="ml-2 text-sm font-medium text-gray-900 dark:text-gray-300">Private</label>  
          </div>
        { type == "false" &&
        <input 
          placeholder="To"
          className="border rounded p-4"
          onChange={e => updateFormInput({ ...formInput, receiver: e.target.value })}
        />}
        <textarea
          placeholder="Message"
          className="mt-2 border rounded p-4"
          onChange={e => updateFormInput({ ...formInput, message: e.target.value })}
        />
        <input
          type="file"
          name="Asset"
          className="my-4"
          onChange={onChange}
        />
        {/* {
          fileUrl && (
            <img className="rounded mt-4" width="350" src={fileUrl} />
          )
        } */}
        <button onClick={listNFTForSale} className="font-bold mt-4 bg-pink-500 text-white rounded p-4 shadow-lg">
          Send Message
        </button>
      </div>
    </div>
  )
}