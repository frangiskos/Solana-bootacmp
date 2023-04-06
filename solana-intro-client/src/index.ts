import * as Web3 from '@solana/web3.js';
import { airdropSolIfNeeded, initializeKeypair } from './lib';

import dotenv from 'dotenv';
import { pingProgram, transferSolToAccount } from './sampleApps';
dotenv.config();

async function main() {
    const connection = new Web3.Connection(Web3.clusterApiUrl('devnet'));
    const signer = await initializeKeypair(connection);
    console.log('Public key:', signer.publicKey.toBase58());

    const secretKey = signer.secretKey;
    console.log('Secret key:', secretKey);

    // show secret key in hex
    const secretKeyHex = Buffer.from(secretKey).toString('hex');
    console.log('Secret key (hex):', secretKeyHex);

    // await airdropSolIfNeeded(signer, connection);

    // await pingProgram(connection, signer);

    // await transferSolToAccount(
    //     connection,
    //     signer,
    //     new Web3.PublicKey('5ThZAMY4RFdKXEBumQWoA7R42aaJrW2XswzzeS6B76Ej'),
    //     123
    // );
}

main()
    .then(() => {
        console.log('Finished successfully');
        process.exit(0);
    })
    .catch((error) => {
        console.log(error);
        process.exit(1);
    });
