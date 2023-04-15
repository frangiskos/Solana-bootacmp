import * as web3 from '@solana/web3.js';
import { Metaplex, bundlrStorage, keypairIdentity, toMetaplexFile } from '@metaplex-foundation/js';
import * as fs from 'fs';
import bs58 from 'bs58';

export async function initializeKeypair(connection: web3.Connection): Promise<web3.Keypair> {
    if (!process.env.PRIVATE_KEY) {
        console.log('No private key found, generating a new keypair... 🗝️');
        const signer = web3.Keypair.generate();

        console.log('Saving private key in .env... 📝');
        if (fs.existsSync('.env')) {
            fs.appendFileSync('.env', `PRIVATE_KEY=[${signer.secretKey.toString()}]`);
        } else {
            fs.writeFileSync('.env', `PRIVATE_KEY=[${signer.secretKey.toString()}]`);
        }

        return signer;
    } else {
        console.log('Private key found, using existing keypair... 🗝️');
        const signer = web3.Keypair.fromSecretKey(new Uint8Array(JSON.parse(process.env.PRIVATE_KEY)));

        console.log('Checking public key... 📝');
        const accountInfo = await connection.getAccountInfo(signer.publicKey);
        if (!accountInfo) {
            throw new Error('The public key does not exist on the network');
        }

        return signer;
    }
}

export async function airdropSolIfNeeded(signer: web3.Keypair, connection: web3.Connection) {
    const balance = await connection.getBalance(signer.publicKey);
    console.log('Current balance is', balance / web3.LAMPORTS_PER_SOL, 'SOL');

    // 1 SOL should be enough for almost anything you wanna do
    if (balance / web3.LAMPORTS_PER_SOL < 1) {
        // You can only get up to 2 SOL per request
        console.log('Airdropping 1 SOL');
        const airdropSignature = await connection.requestAirdrop(signer.publicKey, web3.LAMPORTS_PER_SOL);

        const latestBlockhash = await connection.getLatestBlockhash();

        await connection.confirmTransaction({
            blockhash: latestBlockhash.blockhash,
            lastValidBlockHeight: latestBlockhash.lastValidBlockHeight,
            signature: airdropSignature,
        });

        const newBalance = await connection.getBalance(signer.publicKey);
        console.log('New balance is', newBalance / web3.LAMPORTS_PER_SOL, 'SOL');
    }
}

export async function getPublicKeyFromHex(hex: string): Promise<web3.PublicKey> {
    const publicKeyBytes = Buffer.from(hex, 'hex');
    const publicKeyBase58 = bs58.encode(publicKeyBytes);
    return new web3.PublicKey(publicKeyBase58);
}

export async function getMintMetadataAddress(
    connection: web3.Connection,
    user: web3.Keypair,
    mint: web3.PublicKey
): Promise<web3.PublicKey> {
    const metaplex = Metaplex.make(connection)
        .use(keypairIdentity(user))
        .use(
            bundlrStorage({
                address: 'https://devnet.bundlr.network',
                providerUrl: 'https://api.devnet.solana.com',
                timeout: 60000,
            })
        );

    const metadataPDA = metaplex.nfts().pdas().metadata({ mint });
    return metadataPDA;
}
