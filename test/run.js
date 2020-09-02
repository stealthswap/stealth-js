const { ethers } = require("ethers");

const { namehash, getPublicKey, getSignature, stealthKeySignature } = require("../utils/ens");
const utils = require("../utils/utils")
const domain = 'laguardia.eth'
const STEALTH_MESSAGE = "Signing this message associates the public key with the ENS address"
function recoverPublicKey(message, signature) {
    const messageHash = ethers.utils.hashMessage(message);
    const messageHashBytes = ethers.utils.arrayify(messageHash);
    return ethers.utils.recoverPublicKey(messageHashBytes, signature);
}


(async () => {

    const privateKey = "0xf58dc7d097397596de3768c046f894b42392aa54f79727c3e329b9bfdf369b6d"

    const signer = new ethers.Wallet(privateKey)

    const signature = await signer.signMessage("Signing this message associates the public key with the ENS address");
    console.log("SIGNATURE:", signature)
    console.log(signature == "0x04568fe6a9fc0b57aeebb6a9e6f1da6bcd3ad533d68be61cb13553fdedc133a00bd05ebd6b01931cbb244f822dad3da9890ef95b868750bd9addacf584095dfa1b")
    console.log("DOMAINNAME HASH:", namehash(domain))
    const recoveredPublicKey = recoverPublicKey(STEALTH_MESSAGE, signature);
    console.log("RECOVERED PUBKEY:", recoveredPublicKey)
    const recoveredPubKey2 = await utils.getPublicKeyFromSignature(signature)
    console.log("RECOVERED PUBKEY 2:", recoveredPubKey2)

    const splitSig = {
        "v": 41,
        "r": "0x5c57c63d5222305f304839f64f914d7e2155a4047a24359e772d539342bc18ab",
        "s": "0x66a5ccf64515d9039169642552a94ad30376136ba6d7c0fdee9740f4bd32c220"
    }
    const cSig = ethers.utils.joinSignature(splitSig);
    const rawTx = "0xf901ca06843b9aca008302613e9442d63ae25990889e35f215bc95884039ba35411580b9016410f13a8c8639f93052855f8e052aad9372e41fc9c5f8f1d5f212b33e3a7e1ba5b013c85f000000000000000000000000000000000000000000000000000000000000006000000000000000000000000000000000000000000000000000000000000000a00000000000000000000000000000000000000000000000000000000000000018766e642e737465616c74682d76302d7369676e6174757265000000000000000000000000000000000000000000000000000000000000000000000000000000843078303435363866653661396663306235376165656262366139653666316461366263643361643533336436386265363163623133353533666465646331333361303062643035656264366230313933316362623234346638323264616433646139383930656639356238363837353062643961646461636635383430393564666131620000000000000000000000000000000000000000000000000000000029a05c57c63d5222305f304839f64f914d7e2155a4047a24359e772d539342bc18aba066a5ccf64515d9039169642552a94ad30376136ba6d7c0fdee9740f4bd32c220";
    const msgHash = ethers.utils.keccak256(rawTx);
    const msgBytes = ethers.utils.arrayify(msgHash);
    const recoveredPubKey3 = ethers.utils.recoverPublicKey(msgBytes, cSig);
    console.log("RECOVERED PUBKEY 3:", recoveredPubKey3)

})();