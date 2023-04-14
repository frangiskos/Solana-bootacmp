import * as web3 from '@solana/web3.js';
import * as token from '@solana/spl-token';

export async function runCreateTokenDemos(connection: web3.Connection, user: web3.Keypair, receiver: web3.PublicKey) {
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

    // Transfer 20 tokens to another address
    const receiverTokenAccount = await createTokenAccount({
        connection,
        payer: user,
        mint,
        owner: receiver,
    });
    await transferTokens({
        connection,
        payer: user,
        source: tokenAccount.address,
        destination: receiverTokenAccount.address,
        owner: user.publicKey,
        amount: 20,
        mint,
    });

    // Burn 10 tokens
    await burnTokens({
        connection,
        payer: user,
        account: tokenAccount.address,
        mint,
        owner: user,
        amount: 10,
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
    connection: web3.Connection;
    payer: web3.Keypair;
    mintAuthority: web3.PublicKey;
    freezeAuthority: web3.PublicKey;
    decimals: number;
}): Promise<web3.PublicKey> {
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
    connection: web3.Connection;
    payer: web3.Keypair;
    mint: web3.PublicKey;
    owner: web3.PublicKey;
}) {
    // getOrCreateAssociatedTokenAccount fails if the account doesn't exist because it returns before the account is created (bug)
    let tokenAccount: token.Account | undefined;
    let i = 0;
    while (!tokenAccount) {
        try {
            tokenAccount = await token.getOrCreateAssociatedTokenAccount(connection, payer, mint, owner);
        } catch (error) {
            // wait a few seconds for the account to be created and retry
            await new Promise((resolve) => setTimeout(resolve, 5_000));
            i++;
            if (i > 10) {
                throw new Error(`Failed to create token account after ${i} attempts`);
            }
        }
    }

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
    connection: web3.Connection;
    payer: web3.Keypair;
    mint: web3.PublicKey;
    destination: web3.PublicKey;
    authority: web3.Keypair;
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

async function transferTokens({
    connection,
    payer,
    source,
    destination,
    owner,
    amount,
    mint,
}: {
    connection: web3.Connection;
    payer: web3.Keypair;
    source: web3.PublicKey;
    destination: web3.PublicKey;
    owner: web3.PublicKey;
    amount: number;
    mint: web3.PublicKey;
}) {
    const mintInfo = await token.getMint(connection, mint);

    const transactionSignature = await token.transfer(
        connection,
        payer,
        source,
        destination,
        owner,
        amount * 10 ** mintInfo.decimals
    );

    console.log(`Transfer Transaction: https://explorer.solana.com/tx/${transactionSignature}?cluster=devnet`);
}

async function burnTokens({
    connection,
    payer,
    account,
    mint,
    owner,
    amount,
}: {
    connection: web3.Connection;
    payer: web3.Keypair;
    account: web3.PublicKey;
    mint: web3.PublicKey;
    owner: web3.Keypair;
    amount: number;
}) {
    const mintInfo = await token.getMint(connection, mint);

    const transactionSignature = await token.burn(
        connection,
        payer,
        account,
        mint,
        owner,
        amount * 10 ** mintInfo.decimals
    );

    console.log(`Burn Transaction: https://explorer.solana.com/tx/${transactionSignature}?cluster=devnet`);
}
