import * as Web3 from '@solana/web3.js';
import * as token from '@solana/spl-token';

export async function runCreateTokenDemos(connection: Web3.Connection, user: Web3.Keypair) {
    console.log('PublicKey:', user.publicKey.toBase58());

    const mint = await createNewMint({
        connection,
        payer: user, // We'll pay the fees
        mintAuthority: user.publicKey, // We're the mint authority
        freezeAuthority: user.publicKey, // And the freeze authority >:)
        decimals: 2, // Only two decimals!
    });

    const tokenAccount = await createTokenAccount(
        { connection, payer: user, mint, owner: user.publicKey } // Associating our address with the token account
    );

    // Mint 100 tokens to our address
    await mintTokens({
        connection,
        payer: user,
        mint,
        destination: tokenAccount.address,
        authority: user,
        amount: 100,
    });

    return { mint, tokenAccount };
}

async function createNewMint({
    connection,
    payer,
    mintAuthority,
    freezeAuthority,
    decimals,
}: {
    connection: Web3.Connection;
    payer: Web3.Keypair;
    mintAuthority: Web3.PublicKey;
    freezeAuthority: Web3.PublicKey;
    decimals: number;
}): Promise<Web3.PublicKey> {
    const tokenMint = await token.createMint(connection, payer, mintAuthority, freezeAuthority, decimals);

    console.log(`The token mint account address is ${tokenMint}`);
    console.log(`Token Mint: https://explorer.solana.com/address/${tokenMint}?cluster=devnet`);

    return tokenMint;
}

async function createTokenAccount({
    connection,
    payer,
    mint,
    owner,
}: {
    connection: Web3.Connection;
    payer: Web3.Keypair;
    mint: Web3.PublicKey;
    owner: Web3.PublicKey;
}) {
    const tokenAccount = await token.getOrCreateAssociatedTokenAccount(connection, payer, mint, owner);

    console.log(`Token Account: https://explorer.solana.com/address/${tokenAccount.address}?cluster=devnet`);

    return tokenAccount;
}

async function mintTokens({
    connection,
    payer,
    mint,
    destination,
    authority,
    amount,
}: {
    connection: Web3.Connection;
    payer: Web3.Keypair;
    mint: Web3.PublicKey;
    destination: Web3.PublicKey;
    authority: Web3.Keypair;
    amount: number;
}) {
    const mintInfo = await token.getMint(connection, mint);

    const transactionSignature = await token.mintTo(
        connection,
        payer,
        mint,
        destination,
        authority,
        amount * 10 ** mintInfo.decimals
    );

    console.log(`Mint Token Transaction: https://explorer.solana.com/tx/${transactionSignature}?cluster=devnet`);
}
