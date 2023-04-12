import dotenv from 'dotenv';
import * as web3 from '@solana/web3.js';
import { airdropSolIfNeeded, initializeKeypair } from './lib';
import { runGeneralDemos } from './demos/general';
import { runCreateTokenDemos } from './demos/token';
import { createTokenMetadata } from './demos/tokenMetadata';

async function main() {
    const { connection, user } = await init();
    // await runGeneralDemos(connection, user);
    // const { mint, tokenAccount } = await runCreateTokenDemos(connection, user);
    const mint = new web3.PublicKey('FpMt5qJ4AvPwNzdGz1c9upvkitM1j3oNsZ7Fp91jXmGp');
    await createTokenMetadata({
        connection,
        user,
        mint,
        name: 'Zombie',
        symbol: 'ZBI',
        description: 'You have captured a zombie',
        assetPath: './assets/zombie.png',
        assetName: 'zombie.png',
    });
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
    const connection = new web3.Connection(web3.clusterApiUrl('devnet'));
    const user = await initializeKeypair(connection);
    await airdropSolIfNeeded(user, connection);
    console.log('Public key:', user.publicKey.toBase58());
    return { connection, user };
}
