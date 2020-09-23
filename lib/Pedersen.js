var EC = require('elliptic').ec;
var HN = require('./hex-number.js');

const { utils } = require('../index.js');
const ec = new EC('secp256k1');


class Pedersen {
    // @desc create commitment to a Value X
    // @param r - private Key used as blinding factor
    // @param H - shared point on the curve
    constructor(H, r, x) {
        return ec.g.mul(r).add(H.mul(x));
    }

    // @desc Sum two commitments using homomorphic encryption
    // @return {BigNumber} Cx + Cy
    add(Cx, Cy) {
        return Cx.add(Cy);
    }

    // @desc Subtract two commitments using homomorphic encryption
    // @return {BigNumber} Cx - Cy
     sub(Cx, Cy) {
        return Cx.add(Cy.neg());
    }

    // @desc Add two known values with blinding factors and compute the committed value
    // @param rX blinding factor
    // @param rY blinding factor
    // @param vX hiding value
    // @param vY hiding value
    addCommitted(H, rX, rY, vX, vY) {
        // umod to wrap around if negative result
        var rZ = rX.add(rY).umod(ec.n);
        return ec.g.mul(rZ).add(H.mul(vX + vY));
    }

    // @desc Substract two known values with blinding factors and compute the committed value
    // @param rX blinding factor
    // @param rY blinding factor
    // @param vX hiding value
    // @param vY hiding value
    subCommitted(H, rX, rY, vX, vY) {
        // umod to wrap around if negative
        var rZ = rX.sub(rY).umod(ec.n);
        return ec.g.mul(rZ).add(H.mul(vX - vY));
    }

    // @desc Verifies that the commitment given is the same
    // @param H - secondary point
    // @param C - commitment
    // @param r - blinding factor private key used to create the commitment
    // @param v - original value committed to
    // @return {Boolean}
     verify(H, C, r, v) {
        return ec.g.mul(r).add(H.mul(v)).eq(C);
    }

    // @desc Generate a random number for the chosen curve curve
    // @return {BigNumber} randomly generated random value
     generateRandomNumber() {
        var randNumber = HN.toBN('0');
        var length = 32;
        do {
            randBytes =  utils.shuffled(utils.randomBytes(length));
            randNumber = HN.toBN(HN.fromBuffer(randBytes));
        } while (randNumber.gte(ec.n)); // make sure it's in the safe range
        return randNumber;
    }
    // @desc Generate a random number for the chosen curve curve
    // @return {BigNumber} randomly generated random value
     generateH() {
        return ec.g.mul(generateRandom());
    }

};

