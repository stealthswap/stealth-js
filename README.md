# StealthJS

StealthJS is a javascript SDK for writing privacy preserving DApps integrated
with the StealthSwap protocol.

## Usage

### Installation

```sh

npm install ethers@next
npm install stealthswap-js

```

### Example

```javascript
const ethers = require('ethers')
const stealth = require('stealthswap-js');

// utils and ens are not used below, but their APIs can be found in utils.js and ens.js
const { RandomNumber, KeyPair, utils, ens } = stealth

// Setup ----------------------------------------------------------------------
// Generate a random wallet to simulate the recipient
wallet = ethers.Wallet.createRandom();

// Sender ---------------------------------------------------------------------
// Get a random 32-byte number
const randomNumber = new RandomNumber();

// Generate a KeyPair instance from recipient's public key
const recipientFromPublic = new KeyPair(wallet.publicKey);

// Multiply public key by the random number to get a new KeyPair instance
const stealthFromPublic = recipientFromPublic.mulPublicKey(randomNumber);

// Send fund's to the recipient's stealth receiving address
console.log('Stealth recipient address: ', stealthFromPublic.address);

// Recipient ------------------------------------------------------------------
// Generate a KeyPair instance based on their own private key
const recipientFromPrivate = new KeyPair(wallet.privateKey);

// Multiply their private key by the random number to get a new KeyPair instance
const stealthFromPrivate = recipientFromPrivate.mulPrivateKey(randomNumber);

// Access funds and confirm addresses match
console.log(stealthFromPublic.address === stealthFromPrivate.address); // true
console.log('Private key to access received funds: ', stealthFromPrivate.privateKeyHex);
```

Note that a `KeyPair` instance can be created from a public key, private key, or
transaction hash.

- For private keys, enter the full 66 character key as shown above.
- For public keys, enter the full 132 character key as shown above.
- For transaction hashes, instead of using the `new` keyword we call a static
asynchronous method on the `KeyPair` class, which is necessary because
we must first recover the public key from the transaction data. Use the syntax
below to create a `KeyPair` instances from a transaction hash.

```javascript
// Create KeyPair instance from tx hash
const txHash = '0x123.....';
const recipientFromTxHash = await KeyPair.instanceFromTransaction(txHash, provider);
```

## Development

1. Create a file in this directory called `.env` that looks like the one below.

    ```bash
    INFURA_ID=yourInfuraId
    TEST_ADDRESS=yourEthersAddress
    ```

2. Run `npm install`
3. Run `npm test` to run all tests.
4. Optionally, run `node test/poc.js` to run the proof-of-concept file. If successful, you should see logs similar to the ones below in your console. Note that the two checks under step 6 are the most important, and both should be `true` if the script ran successfully

```text
Step 1: Public key successfully recovered from recipient signature
Step 2: N/A
Step 3: 32-byte random number successfully generated
Step 4: N/A
Step 5: Sender computed receiving address of  0xc9Bd1d593e60F5A2F13b6e4E5Eac749D0F1B05c8
Step 6: Checking that receiver computed same receiving address:
  Check 1:  true
  Check 2:  true

Complete! Outputs are below
  Stealth address:       0xc9Bd1d593e60F5A2F13b6e4E5Eac749D0F1B05c8
  Stealth public key:    0x0465ec7c67ec35ad89ffcc41d071ae5a13cc3236b767fd78d8e4c99c35410a724402eb1a6e496bdd4e373ed1b7d63d8b1ae626539b610ece9ce913c4a0ccd3c7fb
  Stealth private key:   0x3d8c9959c3eba9278e5a57205b234daa3b572fb23f55f1ccc743e40bb357705e
```
