// @desc ES6-Class for managing and abstracting operations over Elliptic Curve
// keys with a focus on SECP256k1 Curve.
// Public Keys are Curve Points with coordinate values (X,Y)
// Private Keys are scalars in the prime field
// p = 2^256 - 2^32 - 2^9 - 2^8 - 2^7 - 2^6 - 2^4 - 1)
// Encryption and Decryption operations are abstracted over the eccrypto library.

const EC = require('elliptic').ec;
const eccrypto = require('eccrypto');
const { keccak256 } = require('js-sha3');
const ethers = require('ethers');
const {
  hexStringToBuffer,
  padHex,
  recoverPublicKeyFromTransaction,
} = require('../utils/utils');

const ec = new EC('secp256k1');
const { utils } = ethers;


class ECKeyPair {

  // @desc Creates new instance from a public key or private key
  // @param {String} key matching one of the two cases:
  // 1. hex public key with 0x04 prefix
  // 2. hex private key with 0x prefix
  // @return {ECKeypair} instance with proper fields computed
  constructor(key) {
    // Input sanitization
    if (!utils.isHexString(key)) throw new Error('Key must be in hex format with 0x prefix');

    // Handle input
    if (key.length === 66) {
      // PRIVATE KEY
      // Save off various forms of the private key
      this.privateKeyHex = key;
      // Remove 0x-prefix
      this.privateKeyHexSlim = key.slice(2);
      // Create EC key from private key
      this.privateKeyEC = ec.keyFromPrivate(this.privateKeyHexSlim);
      // Create instance from private key
      this.privateKeyBN = ethers.BigNumber.from(this.privateKeyHex);

      // Multiply curve's generator point by private key to get public key
      // this is the basePoint * scalar operation
      const publicKey = ec.g.mul(this.privateKeyHexSlim);

      // Create public key instance as coordinate pair
      const publicKeyHexCoordsSlim = {
        x: padHex(publicKey.getX().toString('hex')),
        y: padHex(publicKey.getY().toString('hex')),
      };
      this.publicKeyHex = `0x04${publicKeyHexCoordsSlim.x}${publicKeyHexCoordsSlim.y}`;
    } else if (key.length === 132) {
      // Create public key instance as hex string
      this.publicKeyHex = key;
    } else {
      throw new Error('Key must be a 66 character private key, a 132 character public key, or a transaction hash with isTxHash set to true');
    }
  }

  // @desc Hexlify public key coordinates with 0x-prefix
  // @return (X,Y)-coordinates of the public key
  get publicKeyHexCoords() {
    return {
      x: `0x${padHex(this.publicKeyHexSlim.slice(0, 64))}`,
      y: `0x${padHex(this.publicKeyHexSlim.slice(64))}`,
    };
  }

  // @desc Hexlify public key coordinates without 0x-prefix
  // @return {String,String} (X,Y)-coordinates of the public key
  get publicKeyHexCoordsSlim() {
    return {
      x: padHex(this.publicKeyHexSlim.slice(0, 64)),
      y: padHex(this.publicKeyHexSlim.slice(64)),
    };
  }

  // @return {String} the public key without the 0x prefix
  get publicKeyHexSlim() {
    return this.publicKeyHex.slice(4);
  }

  // @return Returns an elliptic instance generated from the public key
  get publicKeyEC() {
    return ec.keyFromPublic({
      x: this.publicKeyHexCoordsSlim.x,
      y: this.publicKeyHexCoordsSlim.y,
    });
  }

  // @return {BigNumber} the public key as a BigNumber
  get publicKeyBN() {
    return ethers.BigNumber.from(this.publicKeyHex);
  }


  // @return {Array} the public key as bytes array
  get publicKeyBytes() {
    return utils.arrayify(this.publicKeyHex);
  }

  // @desc compute checksum address derived from this key following Ethereum spec.
  // @return {String} Ethereum address derived from public key
  get address() {
    const hash = keccak256(Buffer.from(this.publicKeyHexSlim, 'hex'));
    const addressBuffer = Buffer.from(hash, 'hex');
    const address = `0x${addressBuffer.slice(-20).toString('hex')}`;
    return utils.getAddress(address);
  }


  // @desc Encrypt a random number with the instance's public key
  // @param {RandomNumber} number Random number as instance of RandomNumber class
  // @return {Object} With fields:
  // 16 byte iv, 65 byte ephemeralPublicKey, 96-byte
  // ciphertext (assuming 32 byte random number), and 32 byte mac
  async encrypt(number) {
    // Generate message to encrypt
    const prefix = 'stealth-protocol-v1';
    const message = `${prefix}${number.asHex}`;
    // Encrypt it
    const key = hexStringToBuffer(this.publicKeyHex);
    const output = await eccrypto.encrypt(key, Buffer.from(message));
    // Return ciphertext and public key (include MAC?)
    const result = {
      iv: utils.hexlify(output.iv),
      ephemeralPublicKey: utils.hexlify(output.ephemPublicKey),
      ciphertext: utils.hexlify(output.ciphertext),
      mac: utils.hexlify(output.mac),
    };
    return result;
  }


  // @desc Decrypt a random number with the instance's private key and return the plaintext
  // @param {String} output Output from the encrypt method
  async decrypt(output) {
    // Format output into buffers for eccrypto
    const formattedOutput = {
      iv: hexStringToBuffer(output.iv),
      ephemPublicKey: hexStringToBuffer(output.ephemeralPublicKey),
      ciphertext: hexStringToBuffer(output.ciphertext),
      mac: hexStringToBuffer(output.mac),
    };
    // Decrypt data
    const key = hexStringToBuffer(this.privateKeyHex);
    const plaintext = await eccrypto.decrypt(key, formattedOutput);
    // Return value as string
    return plaintext.toString();
  }


  // @desc Returns new ECKeyPair instance after multiplying this public key by some value
  // @param {RandomNumber, String} value number to multiply by, as class RandomNumber or hex
  // string with 0x prefix
  mulPublicKey(value) {
    // Perform multiplication
    const number = utils.isHexString(value) ? value.slice(2) : value.asHexSlim;
    const publicKey = this.publicKeyEC.getPublic().mul(number);
    // Get x,y hex strings
    const x = padHex(publicKey.getX().toString('hex'));
    const y = padHex(publicKey.getY().toString('hex'));
    // Instantiate and return new instance
    return new ECKeyPair(`0x04${x}${y}`);
  }


  // @desc Returns new ECKeyPair instance after multiplying this private key by some scalar
  // @param {RandomNumber, String} value scalar to multiply by, as class RandomNumber or hex
  // string with the 0x-prefix (as required by ethers.js)
  mulPrivateKey(value) {
    // Get new private key. This gives us an arbitrarily large scalar that is not
    // necessarily in the domain of the secp256k1 elliptic curve
    const scalar = utils.isHexString(value) ? value : value.asHex;
    const privateKeyFull = this.privateKeyBN.mul(scalar);
    // Modulo reduction to enforce private key scalar to be in correct range,
    // where ec.n gives the curve order.
    // We add the 0x prefix as it's required by ethers.js
    const privateKeyMod = privateKeyFull.mod(`0x${ec.n.toString('hex')}`);
    // Remove 0x prefix to adjust padding of hex string, then add back 0x prefix
    const privateKey = `0x${padHex(privateKeyMod.toHexString().slice(2))}`;
    // Create new keypair instance and return it.
    return new ECKeyPair(privateKey);
  }

  // @desc Generate ECKeyPair instance asynchronously from a transaction hash
  // @param {String} txHash Transaction hash to recover public key from
  // @param{**} provider raw web3 provider to use (not an ethers instance)
  static async instanceFromTransaction(txHash, provider) {
    const publicKeyHex = await recoverPublicKeyFromTransaction(txHash, provider);
    return new ECKeyPair(publicKeyHex);
  }
}

module.exports = ECKeyPair;
