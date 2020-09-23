const ens = require('../utils/ens');

class ENSManager {

   // @param {**} provider raw web3 provider to use (not an ethers instance)
   // @param {**} resolution Resolution instance of @unstoppabledomains/resolution
  constructor(provider) {
    this.provider = provider;
  }


   // @desc Computes namehash of the input domain, normalized to ENS or CNS compatibility
   // @param {String} name domain, e.g. myname.eth
  namehash(name) {
    return ens.namehash(name);
  }


   // @desc For a given domain, return the associated stealthswap signature or return
   // undefined if none exists
   // @param {String} name domain, e.g. myname.eth
  async getSignature(name) {
    return await ens.getSignature(name, this.provider);
  }


   // @desc For a given domain, recovers and returns the public key from its signature
   // @param {String} name domain, e.g. myname.eth
  async getPublicKey(name) {
    return await ens.getPublicKey(name, this.provider);
  }


   // @desc For a given domain, sets the associated stealthswap signature
   // @param {String} name domain, e.g. myname.eth
   // @param {String} signature user's signature of the Umbra protocol message
   // @returns {String} Transaction hash
  async setSignature(name, signature) {
    return await ens.setSignature(name, this.provider, signature);
  }
}

module.exports = ENSManager;
