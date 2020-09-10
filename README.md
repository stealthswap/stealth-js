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

// Generate a test wallet for the recipient
wallet = ethers.Wallet.createRandom();

// Sender Phase
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

## Development

1. Create a file in this directory called `.env` that looks like the one below.

    ```bash
    INFURA_ID=yourInfuraId
    TEST_ADDRESS=yourEthersAddress
    ```

2. Run `npm install`
3. Run `npm test` to run all tests.
