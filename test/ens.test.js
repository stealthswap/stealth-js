const { provider } = require('@openzeppelin/test-environment');
const chai = require('chai');
const ens = require('../utils/ens');

const { expect } = chai;

// Ropsten parameters for testing
const name = 'laguardia.eth';
const nameSignature = '0x65ce8a9e5a725ed0de3e71069d7d807bb918c56a74a1bc35d0832e85cc556edc51cb826d7c8b1ea73bd9226f4adf5d18d8cb7a8b27e2a2563f035497add842df1c';
const namePublicKey = '0x04bbe5e9d061395a45c4be2f43edb0aafb5e6b7eefbe6c1ace56bf845c80cd282b34852d24ecb8b8311228ac5d8e2f6ba75f93b156c53e8bb8be119356e60df082';
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

  it.skip('gets the bytecode associated with an ENS address', async () => {
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
