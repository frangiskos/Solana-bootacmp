import * as Web3 from '@solana/web3.js';
import * as fs from 'fs';

export async function initializeKeypair(connection: Web3.Connection): Promise<Web3.Keypair> {
    if (!process.env.PRIVATE_KEY) {
        console.log('No private key found, generating a new keypair... 🗝️');
        const signer = Web3.Keypair.generate();

        console.log('Saving private key in .env... 📝');
        if (fs.existsSync('.env')) {
            fs.appendFileSync('.env', `PRIVATE_KEY=[${signer.secretKey.toString()}]`);
        } else {
            fs.writeFileSync('.env', `PRIVATE_KEY=[${signer.secretKey.toString()}]`);
        }

        return signer;
    } else {
        console.log('Private key found, using existing keypair... 🗝️');
        const signer = Web3.Keypair.fromSecretKey(new Uint8Array(JSON.parse(process.env.PRIVATE_KEY)));

        console.log('Checking public key... 📝');
        const accountInfo = await connection.getAccountInfo(signer.publicKey);
        if (!accountInfo) {
            throw new Error('The public key does not exist on the network');
        }

        return signer;
    }
}

export async function airdropSolIfNeeded(signer: Web3.Keypair, connection: Web3.Connection) {
    const balance = await connection.getBalance(signer.publicKey);
    console.log('Current balance is', balance / Web3.LAMPORTS_PER_SOL, 'SOL');

    // 1 SOL should be enough for almost anything you wanna do
    if (balance / Web3.LAMPORTS_PER_SOL < 1) {
        // You can only get up to 2 SOL per request
        console.log('Airdropping 1 SOL');
        const airdropSignature = await connection.requestAirdrop(signer.publicKey, Web3.LAMPORTS_PER_SOL);

        const latestBlockhash = await connection.getLatestBlockhash();

        await connection.confirmTransaction({
            blockhash: latestBlockhash.blockhash,
            lastValidBlockHeight: latestBlockhash.lastValidBlockHeight,
            signature: airdropSignature,
        });

        const newBalance = await connection.getBalance(signer.publicKey);
        console.log('New balance is', newBalance / Web3.LAMPORTS_PER_SOL, 'SOL');
    }
}
