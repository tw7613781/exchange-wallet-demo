import Web3 from 'web3'

const web3 = new Web3(new Web3.providers.HttpProvider('https://ropsten.infura.io/v3/ab7a19d6d1de466d93a9b6893deff631'))
const accounts = web3.eth.accounts

// privKey = '0x47b0dde41ee2a85f0e6fdbdc2f1958863e1fe7eefc0b43464d2170bae983658e'
const exchangeAddr = '0xe1495f8B30bD5c20fee5cbF2C579b07601cb6A7f'

// userWallet Address
// 0xf76Cbdd6Fc1b4587db13246cC21c205F49f1e28E
// 0xb66C3A85A36E8De7d24c5893564e8654B0c76e46
// 0x10699f3B12bd16D14902718bC9926D75eb29f094
// 0x216F359C97E3eE151158bbcD3C906ea63e697363
const userWalletsPriv = [
    '0xf2757cec3b98e49d7a1ce7db654a0b9e471ff087fe0f02c15bf8954a9f897ad4',
    '0xa8592caaa03583dec02c1a4eecd297492da0ca4b9a3a51a9589e2e42bb8b757b',
    '0xac985ea6ee67729f315eab1fd26b4ad347e685d6c79a7fac0d47f311f3008974',
    '0xe3143da5c59cc18d96c6eccf487db1ab5472065abad8ea21d72a647d5a67db74'
]

const userWallets = []
for (let i = 0; i < 4; i++) {
    userWallets.push(accounts.privateKeyToAccount(userWalletsPriv[i]))
}

// const generateTx = async (receiverAddr) => {
//   const tx = {

//   }
// }

export {
    exchangeAddr,
    userWallets
}
