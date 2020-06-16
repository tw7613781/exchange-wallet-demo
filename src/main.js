import { exchangeAddr, userWallets } from './wallet.js'
import Web3 from 'web3'
// const mainNet = 'https://mainnet.infura.io/v3/ab7a19d6d1de466d93a9b6893deff631'
const ropsten = 'https://ropsten.infura.io/v3/ab7a19d6d1de466d93a9b6893deff631'
const web3 = new Web3(new Web3.providers.HttpProvider(ropsten))

const network = new Map()
network.set(1, 'MainNet')
network.set(3, 'Ropsten')
let blockNumber
const confirm = 4
async function main () {
    try {
        const networkId = await web3.eth.net.getId()
        console.log('Connected successfully to Ethereum', network.get(networkId))
    } catch (e) {
        console.log(`Fail to connect to Ethereum network due to ${e}`)
    }
    await getAllBalance()
    setInterval(async () => await monitorBlocks(), 2000)
}

async function getAllBalance () {
    const exchangeAddrBalance = await web3.eth.getBalance(exchangeAddr)
    console.log(`Exchange address ${exchangeAddr} balance ${web3.utils.fromWei(exchangeAddrBalance)}`)
    for (let i = 0; i < userWallets.length; i++) {
        const balance = await web3.eth.getBalance(userWallets[i].address)
        console.log(`user address ${userWallets[i].address} balance ${web3.utils.fromWei(balance)}`)
    }
}

async function monitorBlocks () {
    const currentBlockNumber = await web3.eth.getBlockNumber()
    if (blockNumber === undefined) {
        blockNumber = currentBlockNumber - confirm - 1
    }
    if (blockNumber + confirm < currentBlockNumber) {
        blockNumber++
        setImmediate(async () => {
            await getBlock(blockNumber)
        })
    }
}

async function getBlock (blockNumber) {
    const block = await web3.eth.getBlock(blockNumber, true)
    console.log(`Block #${block.number}: ${block.hash} ${block.transactions.length}`)
    for (const tx of block.transactions) {
        userWallets.forEach((wallet) => {
            if (wallet.address === tx.to) {
                const receivedEth = web3.utils.fromWei(tx.value)
                console.log(`user address ${wallet.address} received ${receivedEth} ETH in TX hash ${tx.hash}`)
                setImmediate(async () => {
                    await getAllBalance()
                })
            }
        })
        if (exchangeAddr === tx.to) {
            setImmediate(async () => {
                await getAllBalance()
            })
        }
    }
}

main().catch((e) => {
    console.log(e)
})
