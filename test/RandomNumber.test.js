const chai = require('chai');
const ethers = require('ethers');
const RandomNumber = require('../lib/RandomNumber');

const { expect } = chai;
const { utils } = ethers;

describe('RandomNumber class', () => {
  let random;

  beforeEach(() => {
    random = new RandomNumber();
  });

  it('initializes an instance with a 32 byte Uint8Array', () => {
    const { scalar } = random;
    expect(scalar.constructor).to.equal(Uint8Array);
    expect(scalar.length).to.equal(32);
  });

  it('allows random number instances to be initialized with different sizes', () => {
    for (let i = 0; i < 1000; i += 1) {
      const random16 = new RandomNumber(16);
      expect(random16.scalar.length).to.equal(16);
      expect(random16.asHex.length).to.equal(34);
      expect(random16.asHexSlim.length).to.equal(32);
    }
  });

  it('returns random scalar as an ethers BigNumber', () => {
    expect(random.asBN.constructor).to.equal(ethers.BigNumber);
  });

  it('returns random scalar as a hex string', () => {
    for (let i = 0; i < 1000; i += 1) {
      random = new RandomNumber();
      const hex = random.asHex;
      expect(utils.isHexString(hex)).to.be.true;
      expect(hex.length).to.equal(66); // 32-bytes plus leading 0x prefix
    }
  });

  it('returns random scalar as a hex string without the 0x prefix', () => {
    for (let i = 0; i < 1000; i += 1) {
      random = new RandomNumber();
      const hex = random.asHexSlim;
      expect(hex.length).to.equal(64); // 32-bytes plus without 0x prefix
    }
  });
});
