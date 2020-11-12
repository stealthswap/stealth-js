// RandomNumber abstract ethers random number generation which is supposedly
// cryptographically secure.

const ethers = require('ethers');
const { padHex } = require('../utils/utils');

const { utils } = ethers;

class RandomNumber {

  // @desc Generate a new random number abstracting ethers.js
  // @param {Number} length Number of bytes random number should have
  // we enforce the 32 byte to fit the spec of private key scalars
  constructor(length = 32) {
    this.length = length;
    // shuffled is basically Fisher-Yates on randomBytes
    this.scalar = utils.shuffled(utils.randomBytes(length));
    this.value = ethers.BigNumber.from(this.scalar);
  }

  // @desc Get random number as a BigNumber
  // @return {BigNumber} instance from random value
  get asBN() {
    return ethers.BigNumber.from(this.scalar);
  }

  // @desc Get random number as hex string
  // @return {String} hex encoded 0x-preffixed value
  get asHex() {
    return `0x${padHex(this.asBN.toHexString().slice(2), this.length)}`;
  }

  // @desc Get random number as hex string without 0x prefix
  //  @return {String} hex encoded without 0x-prefix value
  get asHexSlim() {
    return padHex(this.asHex.slice(2), this.length);
  }
}

module.exports = RandomNumber;
