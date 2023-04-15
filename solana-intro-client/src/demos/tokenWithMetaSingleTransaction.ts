import { Metaplex, bundlrStorage, keypairIdentity, toMetaplexFile } from '@metaplex-foundation/js';
import { DataV2, createCreateMetadataAccountV2Instruction } from '@metaplex-foundation/mpl-token-metadata';
import { Transaction, SystemProgram, Keypair, Connection, PublicKey, sendAndConfirmTransaction } from '@solana/web3.js';
import {
    createAssociatedTokenAccountInstruction,
    createInitializeMintInstruction,
    createMintToInstruction,
    createTransferInstruction,
    getAssociatedTokenAddress,
    getMinimumBalanceForRentExemptMint,
    MINT_SIZE,
    TOKEN_PROGRAM_ID,
} from '@solana/spl-token';
import fs from 'fs-extra';

type Meta = {
    name: string;
    symbol: string;
    description: string;
    assetName: string;
    assetPath: string;
};
type CreateTokenOptions = {
    decimals: number;
    mintAuthority?: PublicKey;
    freezeAuthority?: PublicKey;
    mintAmount: number;
    transferAmount: number;
    receiver: PublicKey;
};

export async function createTokenWithMetadata({
    connection,
    user,
    options,
    meta,
}: {
    connection: Connection;
    user: Keypair;
    options: CreateTokenOptions;
    meta: Meta;
}) {
    // # create and initialise mint account instructions
    const lamports = await getMinimumBalanceForRentExemptMint(connection);
    const mintAccount = Keypair.generate();

    const createMintAccountInstruction = SystemProgram.createAccount({
        fromPubkey: user.publicKey,
        newAccountPubkey: mintAccount.publicKey,
        space: MINT_SIZE,
        lamports,
        programId: TOKEN_PROGRAM_ID,
    });

    const initialiseMintInstruction = createInitializeMintInstruction(
        mintAccount.publicKey,
        options.decimals,
        options.mintAuthority || user.publicKey,
        options.freezeAuthority || user.publicKey,
        TOKEN_PROGRAM_ID
    );

    // # create metadata account instruction

    // ## setup metaplex
    const metadataUri = await getMetaplexUri(connection, user, meta);
    // ## onchain metadata format
    const tokenMetadata = {
        name: meta.name,
        symbol: meta.symbol,
        uri: metadataUri,
        sellerFeeBasisPoints: 0,
        creators: null,
        collection: null,
        uses: null,
    } as DataV2;

    // ## get metadata account address
    const metaplex = setupMetaplex(connection, user);
    const metadataPDA = metaplex.nfts().pdas().metadata({ mint: mintAccount.publicKey });

    // ## transaction to create metadata account
    const createMetadataAccountInstruction = createCreateMetadataAccountV2Instruction(
        {
            metadata: metadataPDA,
            mint: mintAccount.publicKey,
            mintAuthority: user.publicKey,
            payer: user.publicKey,
            updateAuthority: user.publicKey,
        },
        {
            createMetadataAccountArgsV2: {
                data: tokenMetadata,
                isMutable: true,
            },
        }
    );

    // # create associated token account instruction
    const userAssociateTokenAddress = await getAssociatedTokenAddress(mintAccount.publicKey, user.publicKey);

    const createUserAssociateTokenAccountInstruction = createAssociatedTokenAccountInstruction(
        user.publicKey,
        userAssociateTokenAddress,
        user.publicKey,
        mintAccount.publicKey
    );

    // # mint to user instruction
    const mintToUserInstruction = createMintToInstruction(
        mintAccount.publicKey,
        userAssociateTokenAddress,
        options.mintAuthority || user.publicKey,
        options.mintAmount * 10 ** options.decimals
    );

    // # transfer to recipient instruction
    const receiverAssociateTokenAddress = await getAssociatedTokenAddress(mintAccount.publicKey, options.receiver);

    const createReceiverAssociateTokenAccountInstruction = createAssociatedTokenAccountInstruction(
        user.publicKey,
        receiverAssociateTokenAddress,
        options.receiver,
        mintAccount.publicKey
    );

    const transferToReceiverInstruction = createTransferInstruction(
        userAssociateTokenAddress, // source
        receiverAssociateTokenAddress, // destination
        user.publicKey, // owner
        options.transferAmount * 10 ** options.decimals // amount
    );

    // # mint to recipient instruction
    const mintToRecipientInstruction = createMintToInstruction(
        mintAccount.publicKey,
        receiverAssociateTokenAddress,
        options.mintAuthority || user.publicKey,
        options.transferAmount * 10 ** options.decimals
    );

    // # send transaction
    const transaction = new Transaction()
        .add(createMintAccountInstruction, initialiseMintInstruction)
        .add(createMetadataAccountInstruction)
        .add(createUserAssociateTokenAccountInstruction)
        .add(mintToUserInstruction)
        .add(createReceiverAssociateTokenAccountInstruction)
        .add(transferToReceiverInstruction)
        .add(mintToRecipientInstruction);

    const transactionSignature = await sendAndConfirmTransaction(connection, transaction, [user, mintAccount]);

    // # print results
    console.log(`Token Mint: https://explorer.solana.com/address/${mintAccount.publicKey}?cluster=devnet`);
    console.log(`Token Account: https://explorer.solana.com/address/${userAssociateTokenAddress}?cluster=devnet`);
    console.log(`Token Metadata: https://explorer.solana.com/address/${metadataPDA}?cluster=devnet`);
    console.log(`Token Metadata URI: ${metadataUri}`);
    console.log(`Transaction: https://explorer.solana.com/tx/${transactionSignature}?cluster=devnet`);
}

// metaplex setup
function setupMetaplex(connection: Connection, user: Keypair) {
    const metaplex = Metaplex.make(connection)
        .use(keypairIdentity(user))
        .use(
            bundlrStorage({
                address: 'https://devnet.bundlr.network',
                providerUrl: 'https://api.devnet.solana.com',
                timeout: 60000,
            })
        );
    return metaplex;
}

async function getMetaplexUri(connection: Connection, user: Keypair, meta: Meta) {
    const metaplex = setupMetaplex(connection, user);

    // file to buffer
    const buffer = fs.readFileSync(meta.assetPath);

    // buffer to metaplex file
    const file = toMetaplexFile(buffer, meta.assetName);

    // upload image and get image uri
    const imageUri = await metaplex.storage().upload(file);
    console.log('image uri:', imageUri);

    // upload metadata and get metadata uri (off chain metadata)
    const { uri } = await metaplex.nfts().uploadMetadata({
        name: meta.name,
        description: meta.description,
        image: imageUri,
    });

    return uri;
}

// Public key: GDaKoZTQxaaci1Rwduyv1tYivh8Xb2VXMCS4TvkLovqK
// image uri: https://arweave.net/jkApe9V2Ford8IibFbcPs1NOvbyKG0mFWv_4LsEcAQQ
// Token Mint: https://explorer.solana.com/address/584FYEFxmnPb8vnAVEboKBiwRSf1tqKNBVZAcNiW9Y2Z?cluster=devnet
// Token Account: https://explorer.solana.com/address/GG5rpopxxC7Kw3fFvTxNy1xBDrdLEZJShJZ8kDBpd9dr?cluster=devnet
// Token Metadata: https://explorer.solana.com/address/9U9CPKTeirbDDuMgW5bcWyixACgKHFqhSqFWvMvMjPkR?cluster=devnet
// Token Metadata URI: https://arweave.net/sVCDnBFf-rwp8NXQxNCt6-4TQNflluUBiKS0G_SfYhg
// Transaction: https://explorer.solana.com/tx/5nqSPfop8RedzU3HDhcrZ4nDEFvdqUMfyjmTASgQCnRY4HMni6wcV1JwdfkHxzgYs8ueR2uW2YPYh6ciiW4t2Jy4?cluster=devnet
// Finished successfully
