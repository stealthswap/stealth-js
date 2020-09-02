const { provider } = require('@openzeppelin/test-environment');
const chai = require('chai');
const ens = require('../utils/ens');

const { expect } = chai;

// Truth parameters to test against
const name = 'laguardia.eth';
const nameSignature = '0x04568fe6a9fc0b57aeebb6a9e6f1da6bcd3ad533d68be61cb13553fdedc133a00bd05ebd6b01931cbb244f822dad3da9890ef95b868750bd9addacf584095dfa1b';
const namePublicKey = '0x048c7aec5d23b3fe155d81f6ca3b5137f5114e8518e3b9d840d8927dfd50bc3bc74b40663d3d2f2629666613866291f5c4d1c6efb01768a54cbdbfec195e8d529d';
const nameBytecode = ''; // currently not set

describe('ENS functions', () => {
  it('computes the namehash of an ENS domain', () => {
    // const norm = e
    const hash = ens.namehash('laguardia.eth');
    expect(hash).to.equal('0x8639f93052855f8e052aad9372e41fc9c5f8f1d5f212b33e3a7e1ba5b013c85f');
  });

  it('gets the signature associated with an ENS address', async () => {
    const signature = await ens.getSignature(name, provider);
    expect(signature).to.equal(nameSignature);
  });

  it('gets the public key associated with an ENS address', async () => {
    const publicKey = await ens.getPublicKey(name, provider);
    expect(publicKey).to.equal(namePublicKey);
  });

  it('gets the bytecode associated with an ENS address', async () => {
    const bytecode = await ens.getBytecode(name, provider);
    expect(bytecode).to.equal(nameBytecode).then(done, done);
  });

  it.skip('sets the signature', async () => {
    // TODO currently fails since provider account is not the msolomon.eth account, so
    // to implement this test we need to have the ganache account register an ENS domain
    const dummySignature = '0x123';
    await ens.setSignature(name, provider, dummySignature);
    const signature = await ens.getSignature(name, provider);
    expect(signature).to.equal(dummySignature);
  });

  it.skip('sets the bytecode', async () => {
    // TODO same as above test
    const dummyBytecode = '0x456';
    await ens.setBytecode(name, provider, dummyBytecode);
    const bytecode = await ens.setBytecode(name, provider);
    expect(bytecode).to.equal(dummyBytecode);
  });
});
