const chai = require('chai');
const utils = require('../utils/utils');

const { expect } = chai;

const nameSignature = '0x04568fe6a9fc0b57aeebb6a9e6f1da6bcd3ad533d68be61cb13553fdedc133a00bd05ebd6b01931cbb244f822dad3da9890ef95b868750bd9addacf584095dfa1b';
const namePublicKey = '0x048c7aec5d23b3fe155d81f6ca3b5137f5114e8518e3b9d840d8927dfd50bc3bc74b40663d3d2f2629666613866291f5c4d1c6efb01768a54cbdbfec195e8d529d';

describe('utils functions', () => {
  it('recovers the public key from a signature', async () => {
    const publicKey = await utils.getPublicKeyFromSignature(nameSignature);
    expect(publicKey).to.equal(namePublicKey);
  });
});
