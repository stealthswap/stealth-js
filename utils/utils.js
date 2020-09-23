// Utility functions that take care of padding, public key recoverey from (v,r,s)
// signature, formatting and transaction reconstruction.

const ethers = require('ethers');

const { utils } = ethers;
const constants = require('../constants.json');

// Taken from somwhere in the internets credits to them.
// @desc adjust padding with leading zeroes to ensure hex strings are the expected length.
// We always expect a hex value to have the full number of characters for its size,
// so we use this function to enforce hex character lengths.
// Spec wise the following cases are defined :
//   1. It seems elliptic.js strips unnecessary leading zeros when pulling out
//      point coordinates (X,Y) from public keys.
//   2. Computing a new private key from a random number, the new number
//      (representing private key scalar) may not necessarily require all 32-bytes
//      as ethers.js also seems to strip leading zeroes.
//   3. When generating random numbers and returning them as hex strings, the leading
//      zero bytes get stripped
// @param {String} hex String to pad, without leading 0x
// @param {String} bytes Number of bytes string should have
module.exports.padHex = (hex, bytes = 32) => {
  if (!utils.isHexString) throw new Error('Input is not a valid hex string');
  if (hex.slice(0, 2) === '0x') { throw new Error('Input must not contain 0x prefix'); }
  return hex.padStart(bytes * 2, 0);
};


// @desc Convert hex string with 0x prefix into Buffer
// @param {String} data Hex string to convert
module.exports.hexStringToBuffer = (data) => Buffer.from(utils.arrayify(data));

// @desc Given a transaction hash, return the public key of the transaction's sender
// @dev See https://github.com/ethers-io/ethers.js/issues/700 for an example of
// recovering public key from a transaction with ethers
// @param {String} txHash Transaction hash to recover public key from
// @param {*} provider raw web3 provider to use (not an ethers instance)
module.exports.recoverPublicKeyFromTransaction = async (txHash, provider) => {
  // Get transaction data
  const ethersProvider = new ethers.providers.Web3Provider(provider);
  const tx = await ethersProvider.getTransaction(txHash);

  // Get original signature
  const splitSignature = {
    r: tx.r,
    s: tx.s,
    v: tx.v,
  };
  const signature = utils.joinSignature(splitSignature);

  // Reconstruct transaction data that was originally signed (follows account abstraction)
  const txData = {
    chainId: tx.chainId,
    data: tx.data,
    gasLimit: tx.gasLimit,
    gasPrice: tx.gasPrice,
    nonce: tx.nonce,
    to: tx.to, // this works for both regular and contract transactions
    value: tx.value,
  };

  // Take care of formatting it to get the correct message
  const resolvedTx = await utils.resolveProperties(txData);
  const rawTx = utils.serializeTransaction(resolvedTx);
  const msgHash = utils.keccak256(rawTx);
  const msgBytes = utils.arrayify(msgHash);

  // Recover sender's public key and address
  const publicKey = utils.recoverPublicKey(msgBytes, signature);
  return publicKey;
};

// @desc Returns the public key recovered from the signature
// @param {String} signature
// @return {String} recovered public key from a signature
module.exports.getPublicKeyFromSignature = async (signature) => {
  const msgHash = ethers.utils.hashMessage(constants.STEALTH_MESSAGE);
  const msgHashBytes = ethers.utils.arrayify(msgHash);
  const publicKey = await ethers.utils.recoverPublicKey(msgHashBytes, signature);
  return publicKey;
}
