const { provider } = require('@openzeppelin/test-environment');
const chai = require('chai');
const ENSManager = require('../lib/ENSManager');
const { ENS_TESTNET_RESOLVER } = require('../constants.json');

const { expect } = chai;

const DomainMan = new ENSManager(provider, ENS_TESTNET_RESOLVER);

// Truth parameters to test against
const ensName = 'laguardia.eth';
const ensNameSignature = '0x04568fe6a9fc0b57aeebb6a9e6f1da6bcd3ad533d68be61cb13553fdedc133a00bd05ebd6b01931cbb244f822dad3da9890ef95b868750bd9addacf584095dfa1b';
const ensNamePublicKey = '0x048c7aec5d23b3fe155d81f6ca3b5137f5114e8518e3b9d840d8927dfd50bc3bc74b40663d3d2f2629666613866291f5c4d1c6efb01768a54cbdbfec195e8d529d';

describe('ENSManager class', () => {
  it('computes the namehash of an ENS domain', () => {
    const hash = DomainMan.namehash(ensName);
    expect(hash).to.equal('0x8639f93052855f8e052aad9372e41fc9c5f8f1d5f212b33e3a7e1ba5b013c85f');
  });

  it('gets the signature associated with a ENS address', async function () {
    const signature = await DomainMan.getSignature(ensName);
    expect(signature).to.equal(ensNameSignature);
  });

  it('gets the public key associated with a ENS address', async function () {
    this.timeout(10000);
    const publicKey = await DomainMan.getPublicKey(ensName);
    expect(publicKey).to.equal(ensNamePublicKey);
  });
});
