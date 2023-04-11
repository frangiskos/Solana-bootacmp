import { Metaplex, toMetaplexFile } from '@metaplex-foundation/js';
import { DataV2, createCreateMetadataAccountV2Instruction } from '@metaplex-foundation/mpl-token-metadata';
import * as web3 from '@solana/web3.js';
import fs from 'fs-extra';

export async function createTokenMetadata(
    connection: web3.Connection,
    metaplex: Metaplex,
    mint: web3.PublicKey,
    user: web3.Keypair,
    name: string,
    symbol: string,
    description: string
) {
    // file to buffer
    const buffer = fs.readFileSync('assets/zombie-face.png');

    // buffer to metaplex file
    const file = toMetaplexFile(buffer, 'zombie-face.png');

    // upload image and get image uri
    const imageUri = await metaplex.storage().upload(file);
    console.log('image uri:', imageUri);

    // upload metadata and get metadata uri (off chain metadata)
    const { uri } = await metaplex.nfts().uploadMetadata({
        name: name,
        description: description,
        image: imageUri,
    });

    console.log('metadata uri:', uri);

    // get metadata account address
    const metadataPDA = metaplex.nfts().pdas().metadata({ mint });

    // onchain metadata format
    const tokenMetadata = {
        name: name,
        symbol: symbol,
        uri: uri,
        sellerFeeBasisPoints: 0,
        creators: null,
        collection: null,
        uses: null,
    } as DataV2;

    // transaction to create metadata account
    const transaction = new web3.Transaction().add(
        createCreateMetadataAccountV2Instruction(
            {
                metadata: metadataPDA,
                mint: mint,
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
        )
    );

    // send transaction
    const transactionSignature = await web3.sendAndConfirmTransaction(connection, transaction, [user]);

    console.log(`Create Metadata Account: https://explorer.solana.com/tx/${transactionSignature}?cluster=devnet`);
}
