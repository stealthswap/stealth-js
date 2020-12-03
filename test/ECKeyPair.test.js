const { provider } = require('@openzeppelin/test-environment');
const chai = require('chai');
const ethers = require('ethers');

const KeyPair = require('../lib/ECKeyPair');
const RandomNumber = require('../lib/RandomNumber');
const utils = require('../utils/utils');

const { expect } = chai;

// Address, public key, and private key from first deterministic ganache account
const address = '0x90F8bf6A479f320ead074411a4B0e7944Ea8c9C1';
const publicKey = '0x04e68acfc0253a10620dff706b0a1b1f1f5833ea3beb3bde2250d5f271f3563606672ebc45e0b7ea2e816ecb70ca03137b1c9476eec63d4632e990020b7b6fba39';
const privateKey = '0x4f3edf983ac636a65a842ce7c78d9aa706d3b113bce9c46f30d7d21715b23b1d';

describe('KeyPair class', () => {
  let wallet;

  beforeEach(() => {
    wallet = ethers.Wallet.createRandom();
  });

  it('initializes an instance with valid private key', () => {
    // Check against ganache account
    const keyPair = new KeyPair(privateKey);
    expect(keyPair.address).to.equal(address);
    // Check against random wallet
    const keyPair2 = new KeyPair(wallet.privateKey);
    expect(keyPair2.address).to.equal(wallet.address);
  });

  it('initializes an instance with valid public key', () => {
    const keyPair = new KeyPair(wallet.publicKey);
    expect(keyPair.address).to.equal(wallet.address);
  });

  it('initializes an instance from a regular transaction', async () => {
    // Specify mainnet transaction hash and its sender
    const txHash = '0xf2225f839ec0c70a944db242918311a26a230e2db3cb8d1aeaf5d50018a80444';
    const from = '0x75268517cA98858ABf8a1B0cFDa31b6dF9E2BBce';
    // Create instance and check result
    const keyPair = await KeyPair.instanceFromTransaction(txHash, provider);
    expect(keyPair.address).to.equal(from);
  });

  it('initializes an instance from a contract interaction transaction', async () => {
    // Specify ropsten transaction hash and its sender
    const txHash = '0x71dedd00076997826edbe23bf6f4940bf6508f2e22659ebaec5ab0b1c7aac0e7';
    const from = '0x60A5dcB2fC804874883b797f37CbF1b0582ac2dD';
    // Create instance and check result
    const keyPair = await KeyPair.instanceFromTransaction(txHash, provider);
    expect(keyPair.address).to.equal(from);
  });

  it('initializes an instance from a contract creation transaction', async () => {
    // Specify ropsten transaction hash and its sender
    const txHash = '0x3ee10348af19430826703aeb303f53b9c307a4fedefc3533f2a428f8272d2016';
    const from = '0xc46315d82FFe8BF93311dfD43c2b8ECBf5faDfB9';
    // Create instance and check result
    const keyPair = await KeyPair.instanceFromTransaction(txHash, provider);
    expect(keyPair.address).to.equal(from);
  });

  it('will recover the public key from an arbitrary transaction', async () => {
    // Specify ropsten transaction hash and its sender
    const txHash = '0x285899397217daba600899add0953eb621605497fcd4979afea9409f81d8b7fa';
    const sendersPublicKey = '0x04df3d784d6d1e55fabf44b7021cf17c00a6cccc53fea00d241952ac2eebc46dc674c91e60ccd97576c1ba2a21beed21f7b02aee089f2eeec357ffd349488a7cee';
    // Create instance and check result
    const recoveredPublicKey = await utils.recoverPublicKeyFromTransaction(txHash, provider);
    expect(recoveredPublicKey).to.equal(sendersPublicKey);
  });

  it('should not initialize an instance without the 0x prefix', () => {
    expect(() => new KeyPair(privateKey.slice(2)))
      .to.throw('Key must be in hex format with 0x prefix');
    expect(() => new KeyPair(wallet.publicKey.slice(4)))
      .to.throw('Key must be in hex format with 0x prefix');
  });

  it('properly derives public key parameters with both key-based constructor methods', () => {
    const keyPair1 = new KeyPair(wallet.privateKey);
    const keyPair2 = new KeyPair(wallet.publicKey);

    expect(keyPair1.publicKeyHex).to.equal(keyPair2.publicKeyHex);
    expect(keyPair1.publicKeyHexSlim).to.equal(keyPair2.publicKeyHexSlim);
    expect(keyPair1.publicKeyHeCoords).to.equal(keyPair2.publicKeyHeCoords);
    expect(keyPair1.publicKeyHeCoords).to.equal(keyPair2.publicKeyHeCoords);
    expect(keyPair1.publicKeyBN.toHexString()).to.equal(keyPair2.publicKeyBN.toHexString());
    expect(JSON.stringify(keyPair1.publicKeyEC)).to.equal(JSON.stringify(keyPair2.publicKeyEC));
  });

  it('supports encryption and decryption of the random number', async () => {
    for (let i = 0; i < 100; i += 1) {
      // Do a bunch of tests with random wallets and numbers
      wallet = ethers.Wallet.createRandom();
      // Encrypt payload
      const number = new RandomNumber(); 
      const keyPairFromPublic = new KeyPair(wallet.publicKey); 
      const output = await keyPairFromPublic.encrypt(number); // eslint-disable-line no-await-in-loop
      // Decrypt payload
      const keyPairFromPrivate = new KeyPair(wallet.privateKey);
      const plaintext = await keyPairFromPrivate.decrypt(output); // eslint-disable-line no-await-in-loop
      expect(plaintext).to.equal(number.asHex);
    }
  }); 
  it('lets sender generate stealth receiving address that recipient can access', () => {
    // Generate random number
    const randomNumber = new RandomNumber();
    // Sender computes receiving address from random number and recipient's public key
    const recipientFromPublic = new KeyPair(wallet.publicKey);
    const stealthFromPublic = recipientFromPublic.mulPublicKey(randomNumber);
    // Recipient computes new private key from random number and derives receiving address
    const recipientFromPrivate = new KeyPair(wallet.privateKey);
    const stealthFromPrivate = recipientFromPrivate.mulPrivateKey(randomNumber);
    // Confirm outputs match
    expect(stealthFromPrivate.address).to.equal(stealthFromPublic.address);
    expect(stealthFromPrivate.publicKeyHex).to.equal(stealthFromPublic.publicKeyHex);
  });

  it('asserts valid stealthaddress derivation', () => {
    // generate a random number
    const randomNumber = '0x6e99112f975cdae154a9bbfab8502f0823478142e5e656ab3a5f58012a681160';
    const receiverPublicKey = '0x04611c4133f6cba43e2f25a2d372bff20fd4e7ab80cfa8ccf485e387108822e13e042f5e5fcd78857f2ce6242902eba6a1d99f17ac5b1cdf3a42613db8bdc0553b';
    const receiverWallet = new KeyPair(receiverPublicKey);
    const stealthAddress = receiverWallet.mulPublicKey(randomNumber);
    const receiverPrivateKey = '0xdafead2ec5a560f20577c9509b5c0459126ec513355894be44f1d6294ec1ce37';
    const receiverWalletFromPrivate = new KeyPair(receiverPrivateKey);
    const stealthAddressFromPrivateKey = receiverWalletFromPrivate.mulPrivateKey(randomNumber);
    console.log(stealthAddress.address);
    console.log(stealthAddressFromPrivateKey.address);
    expect(stealthAddress.address).to.equal(stealthAddressFromPrivateKey.address);
  });
  it('lets multiplication be performed with RandomNumber class or hex string', () => {
    const numRuns = 100;
    for (let i = 0; i < numRuns; i += 1) {
      // Generate random number and wallet
      const randomNumber = new RandomNumber();
      const randomWallet = ethers.Wallet.createRandom();
      const randomFromPublic = new KeyPair(randomWallet.publicKey);
      const randomFromPrivate = new KeyPair(randomWallet.privateKey);

      // Compare public key multiplication
      const stealthFromClassPublic = randomFromPublic.mulPublicKey(randomNumber);
      const stealthFromStringPublic = randomFromPublic.mulPublicKey(randomNumber.asHex);
      expect(stealthFromClassPublic.address).to.equal(stealthFromStringPublic.address);

      // Compare private key multiplication
      const stealthFromClassPrivate = randomFromPrivate.mulPrivateKey(randomNumber);
      const stealthFromStringPrivate = randomFromPrivate.mulPrivateKey(randomNumber.asHex);
      expect(stealthFromClassPrivate.address).to.equal(stealthFromStringPrivate.address);

      const stealthFromClassPrivate2 = randomFromPrivate.mulPublicKey(randomNumber);
      const stealthFromStringPrivate2 = randomFromPrivate.mulPublicKey(randomNumber.asHex);
      expect(stealthFromClassPrivate2.address).to.equal(stealthFromStringPrivate2.address);
    }
  })

  it('works for any randomly generated number and wallet', () => {
    /* eslint-disable no-console */
    let numFailures = 0;
    const numRuns = 100;
    console.log(`Testing ${numRuns} random numbers and wallets to ensure all pass...`);
    for (let i = 0; i < numRuns; i += 1) {
      if ((i + 1) % 100 === 0) console.log(`Executing run ${i + 1} of ${numRuns}...`);
      // Generate random number and wallet
      const randomNumber = new RandomNumber();
      const randomWallet = ethers.Wallet.createRandom();
      // Sender computes receiving address from random number and recipient's public key
      const recipientFromPublic = new KeyPair(randomWallet.publicKey);
      const stealthFromPublic = recipientFromPublic.mulPublicKey(randomNumber);
      // Recipient computes new private key from random number and derives receiving address
      const recipientFromPrivate = new KeyPair(randomWallet.privateKey);
      const stealthFromPrivate = recipientFromPrivate.mulPrivateKey(randomNumber);
      // Confirm outputs match
      if (
        stealthFromPrivate.address !== stealthFromPublic.address
        || stealthFromPrivate.publicKeyHex !== stealthFromPublic.publicKeyHex
      ) {
        numFailures += 1;
        console.log();
        console.log(`FAILURE #${numFailures} ========================================`);
        console.log('Inputs');
        console.log('  Wallet Private Key:  ', wallet.privateKey);
        console.log('  Wallet Public Key:   ', wallet.publicKey);
        console.log('  Wallet Address:      ', wallet.address);
        console.log('  Random Number:       ', randomNumber.asHex);
        console.log('Outputs');
        console.log('  Stealth from Public,  Address:     ', stealthFromPublic.address);
        console.log('  Stealth from Private, Address:     ', stealthFromPrivate.address);
        console.log('  Stealth from Public,  Public Key:  ', stealthFromPublic.publicKeyHex);
        console.log('  Stealth from Private, Public Key:  ', stealthFromPrivate.publicKeyHex);
      }
    }
    expect(numFailures).to.equal(0);
    /* eslint-disable no-console */
  });
});
