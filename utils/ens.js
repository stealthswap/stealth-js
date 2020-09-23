// Abstractted functions to interact with the ENS service.

const ethers = require('ethers');
const ensNamehash = require('eth-ens-namehash');
const constants = require('../constants.json');
const publicResolverAbi = require('../abi/PublicResolver.json');
const { getPublicKeyFromSignature } = require('./utils');
const { createContract } = require('./contract');

const { ENS_PUBLIC_RESOLVER } = constants;

// @desc ENS Text record for stealthswap signatures
const stealthKeySignature = 'vnd.stealth-v0-signature';
// @desc ENS Text record for stealthswap bytecode (Future requirement)
const stealthKeyBytecode = 'vnd.stealth-v0-bytecode';

// Disable of ethers warnings since it warns about overloaded functions in PublicResolver ABI
ethers.utils.Logger.setLogLevel('error');

// @desc Computes ENS namehash of the input ENS domain, following ENS spec.
// @param {String} name ENS domain, e.g. myname.eth
function namehash(name) {
  return ensNamehash.hash(ensNamehash.normalize(name));
}

// @desc For a given ENS domain, return the associated stealthswap signature or return
// undefined if none exists
// @param {String} name ENS domain, e.g. myname.eth
// @param {*} provider raw web3 provider to use (not an ethers instance)
async function getSignature(name, provider) {
  const publicResolver = createContract(ENS_PUBLIC_RESOLVER, publicResolverAbi, provider);
  const signature = await publicResolver.text(namehash(name), stealthKeySignature);
  return signature;
}

// @desc For a given ENS domain, recovers and returns the public key from its signature
// @param {String} name ENS domain, e.g. myname.eth
// @param {*} provider raw web3 provider to use (not an ethers instance)
async function getPublicKey(name, provider) {
  const signature = await getSignature(name, provider);
  if (!signature) return undefined;
  return await getPublicKeyFromSignature(signature);
}

// @desc For a given ENS domain, return the associated stealthswap bytecode or return
// undefined if none exists
// @param {String} name ENS domain, e.g. myname.eth
// @param {*} provider raw web3 provider to use (not an ethers instance)
async function getBytecode(name, provider) {
  const publicResolver = createContract(ENS_PUBLIC_RESOLVER, publicResolverAbi, provider);
  const bytecode = await publicResolver.text(namehash(name), stealthKeyBytecode);
  return bytecode;
}

// @desc For a given ENS domain, sets the associated stealthswap signature
// @param {String} name ENS domain, e.g. myname.eth
// @param {*} provider raw web3 provider to use (not an ethers instance)
// @param {String} signature user's signature of the Umbra protocol message
// @returns {String} Transaction hash
async function setSignature(name, provider, signature) {
  const publicResolver = createContract(ENS_PUBLIC_RESOLVER, publicResolverAbi, provider);
  const tx = await publicResolver.setText(namehash(name), stealthKeySignature, signature);
  await tx.wait();
  return tx.hash;
}

// @desc For a given ENS domain, sets the associated stealthswap bytecode
// @param {String} name ENS domain, e.g. myname.eth
// @param {*} provider raw web3 provider to use (not an ethers instance)
// @param {String} bytecode contract bytecode to associate with ENS domain
// @returns {String} Transaction hash
async function setBytecode(name, provider, bytecode) {
  const publicResolver = createContract(ENS_PUBLIC_RESOLVER, publicResolverAbi, provider);
  const node = namehash(name);
  const tx = await publicResolver.setText(node, stealthKeyBytecode, bytecode);
  await tx.wait();
  return tx.hash;
}

module.exports = {
  // Functions
  namehash,
  getSignature,
  getPublicKey,
  getBytecode,
  setSignature,
  setBytecode,
  // Constants
  stealthKeySignature,
  stealthKeyBytecode,
};
