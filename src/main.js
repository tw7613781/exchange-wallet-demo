import { exchangeAddr, userWallets } from './wallet.js'
import Web3 from 'web3'
// const mainNet = 'https://mainnet.infura.io/v3/ab7a19d6d1de466d93a9b6893deff631'
const ropsten = 'https://ropsten.infura.io/v3/ab7a19d6d1de466d93a9b6893deff631'
const web3 = new Web3(new Web3.providers.HttpProvider(ropsten))

const network = new Map()
network.set(1, 'mainnet')
network.set(3, 'ropsten')
let networkId
let blockNumber
const confirm = 4
async function main () {
    try {
        networkId = await web3.eth.net.getId()
        console.log('Connected successfully to Ethereum', network.get(networkId))
    } catch (e) {
        console.log(`Fail to connect to Ethereum network due to ${e}`)
    }
    getAllBalance()
    setInterval(monitorBlocks, 2000)
}

async function getAllBalance () {
    const exchangeAddrBalance = await web3.eth.getBalance(exchangeAddr)
    console.log(`Exchange address ${exchangeAddr} balance ${web3.utils.fromWei(exchangeAddrBalance)}`)
    for (let i = 0; i < userWallets.length; i++) {
        const balance = await web3.eth.getBalance(userWallets[i].address)
        console.log(`User address ${userWallets[i].address} balance ${web3.utils.fromWei(balance)}`)
    }
}

async function monitorBlocks () {
    const currentBlockNumber = await web3.eth.getBlockNumber()
    if (blockNumber === undefined) {
        blockNumber = currentBlockNumber - confirm - 1
    }
    if (blockNumber + confirm < currentBlockNumber) {
        blockNumber++
        setImmediate(getBlock, blockNumber)
    }
}

async function getBlock (blockNumber) {
    const block = await web3.eth.getBlock(blockNumber, true)
    console.log(`Block #${block.number}: ${block.hash} ${block.transactions.length}`)
    for (const tx of block.transactions) {
        userWallets.forEach((wallet) => {
            if (wallet.address === tx.to) {
                const receivedEth = web3.utils.fromWei(tx.value)
                console.log(`User address ${wallet.address} received ${receivedEth} ETH in TX hash ${tx.hash}`)
                setImmediate(sendAll, wallet, exchangeAddr)
            }
        })
        if (exchangeAddr === tx.to) {
            setImmediate(getAllBalance)
        }
    }
}

async function sendAll (senderWallet, receivedAddr) {
    console.log(`User address ${senderWallet.address} start sendting to exchange address`)
    const balance = await web3.eth.getBalance(senderWallet.address)
    const gasPrice = await web3.eth.getGasPrice()
    const nonce = await web3.eth.getTransactionCount(senderWallet.address)

    const rawTx = {
        nonce,
        to: receivedAddr,
        gasPrice: gasPrice,
        chainId: networkId
    }

    const gasLimit = await web3.eth.estimateGas(rawTx)
    const transactionFee = gasPrice * gasLimit
    if (transactionFee > balance) {
        return console.log(`User address ${senderWallet.address} balance ${balance} is insufficient to pay for the estimate transaction fee ${transactionFee}`)
    }
    rawTx.value = balance - transactionFee
    rawTx.gas = gasLimit

    const signedTx = await web3.eth.accounts.signTransaction(rawTx, senderWallet.privateKey)
    web3.eth.sendSignedTransaction(signedTx.rawTransaction)
        .on('receipt', (recipt) => {
            if (recipt.status) {
                console.log(`User address ${senderWallet.address} sent all to exchange address in tx ${recipt.transactionHash}`)
            } else {
                console.log(`User address ${senderWallet.address} sent failed`)
            }
        })
}

main().catch((e) => {
    console.log(e)
})
