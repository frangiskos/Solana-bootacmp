import dotenv from 'dotenv';
import * as Web3 from '@solana/web3.js';
import { airdropSolIfNeeded, initializeKeypair } from './lib';
import { runGeneralDemos } from './demos/general';
import { runCreateTokenDemos } from './demos/token';

async function main() {
    const { connection, signer } = await init();
    await runGeneralDemos(connection, signer);
    await runCreateTokenDemos(connection, signer);
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

async function init() {
    dotenv.config();
    const connection = new Web3.Connection(Web3.clusterApiUrl('devnet'));
    const signer = await initializeKeypair(connection);
    await airdropSolIfNeeded(signer, connection);
    console.log('Public key:', signer.publicKey.toBase58());
    return { connection, signer };
}
