# StealthSwapJS

StealthSwapJS is a javascript SDK for writing privacy preserving DApps integrated
with the StealthSwap protocol.

This SDK is aimed towards dapp developers who wish to integrate stealth address and integrate privacy enhancing
mechanism to distribute tokens, rewards...

The library provides all the low-level primitives and higher-level abstractions for Elliptic Curve Cryptography and integrates
with ENS to publish signed messages or recover public keys from the reverse record.

Developers are required to write the handling code as well as wallet utilities for their users.

## Usage

### Installation

```sh

npm install ethers@next
npm install stealthswap-js

```
### Integrations

The StealthSwapJS SDK is a javascript implementation that interacts with Ethereum mainnet and testnet (Ropsten) and permits
generating **Stealth Addresses** to integrate into your dapp.

```javascript

// Import the ethers-js library for Ethereum spec conforming utilities
const ethers = require('ethers');

// Import the StealthSwap-JS Library
const stealth = require('stealthswap-js');

/**
* Recover a public key from a signed message
*/
function recoverPublicKey(message, signature) {
  const messageHash = ethers.utils.hashMessage(message);
  const messageHashBytes = ethers.utils.arrayify(messageHash);
  return ethers.utils.recoverPublicKey(messageHashBytes, signature);
}

/**
* Generate a new stealth address from a given a public key or ethers compliant wallet.
*/
const randomNumber = new stealth.RandomNumber();
const wallet = new ethers.Wallet(); 
const receiverPublicKey = new KeyPair(receiver.publicKey);
const stealthPublicKey = receiverPublicKey.mulPublicKey(randomNumber);
const stealthAddressFromPublic = stealthPublicKey.address;

```

