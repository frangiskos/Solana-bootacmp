import dotenv from 'dotenv';
import * as web3 from '@solana/web3.js';
import { airdropSolIfNeeded, initializeKeypair } from './lib';
import { runGeneralDemos } from './demos/general';
import { runCreateTokenDemos } from './demos/token';
import { createTokenMetadata } from './demos/tokenMetadata';
import { createTokenWithMetadata } from './demos/tokenWithMetaSingleTransaction';
import { nftDemos } from './demos/nft';

async function main() {
    dotenv.config();
    const { connection, user } = await init();

    // # General Demos
    // await runGeneralDemos(connection, user);

    // # Token Demos
    // const { mint, tokenAccount } = await runCreateTokenDemos(
    //     connection,
    //     user,
    //     new web3.PublicKey('5ThZAMY4RFdKXEBumQWoA7R42aaJrW2XswzzeS6B76Ej')
    // );
    // // const mint = new web3.PublicKey('FpMt5qJ4AvPwNzdGz1c9upvkitM1j3oNsZ7Fp91jXmGp');
    // await createTokenMetadata({
    //     connection,
    //     user,
    //     mint,
    //     name: 'Zombie2',
    //     symbol: 'ZBII',
    //     description: 'You have captured a zombie2',
    //     assetPath: './assets/zombie.png',
    //     assetName: 'zombie.png',
    // });

    // # Token with Metadata in a single transaction
    // ## Create and initialise mint
    // ## create metaplex metadata account
    // ## create associate token account for user
    // ## mint tokens to user
    // ## create associate token account for receiver
    // ## transfer tokens to receiver
    // ## mint tokens to receiver
    await createTokenWithMetadata({
        connection,
        user,
        options: {
            decimals: 2,
            mintAuthority: user.publicKey,
            freezeAuthority: user.publicKey,
            mintAmount: 100,
            transferAmount: 20,
            receiver: new web3.PublicKey('5ThZAMY4RFdKXEBumQWoA7R42aaJrW2XswzzeS6B76Ej'),
        },
        meta: {
            name: 'Zombie3',
            symbol: 'ZBIII',
            description: 'You have captured a zombie 3',
            assetPath: './assets/zombie.png',
            assetName: 'zombie.png',
        },
    });

    // await nftDemos(connection, user);
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
    const connection = new web3.Connection(web3.clusterApiUrl('devnet'));
    const user = await initializeKeypair(connection);
    await airdropSolIfNeeded(user, connection);
    console.log('Public key:', user.publicKey.toBase58());
    return { connection, user };
}
