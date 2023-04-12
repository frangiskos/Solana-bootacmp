import { Metaplex, bundlrStorage, keypairIdentity, toMetaplexFile } from '@metaplex-foundation/js';
import { DataV2, createCreateMetadataAccountV2Instruction } from '@metaplex-foundation/mpl-token-metadata';
import * as web3 from '@solana/web3.js';
import fs from 'fs-extra';

// async function main(
//     connection: web3.Connection,
//     user: web3.Keypair,
//     {
//         mint,
//         tokenName,
//         tokenSymbol,
//         tokenDescription,
//     }: {
//         mint: string;
//         tokenName: string;
//         tokenSymbol: string;
//         tokenDescription: string;
//     }
// ) {
//     // // MAKE SURE YOU REPLACE THIS ADDRESS WITH YOURS!
//     // const MINT_ADDRESS = "87MGWR6EbAqegYXr3LoZmKKC9fSFXQx4EwJEAczcMpMF"

//     // metaplex setup
//     const metaplex = Metaplex.make(connection)
//         .use(keypairIdentity(user))
//         .use(
//             bundlrStorage({
//                 address: 'https://devnet.bundlr.network',
//                 providerUrl: 'https://api.devnet.solana.com',
//                 timeout: 60000,
//             })
//         );

//     // Calling the token
//     await createTokenMetadata(
//         connection,
//         user,
//         new web3.PublicKey(mint),
//         'Zombie', // Token name - REPLACE THIS WITH YOURS
//         'ZBI', // Token symbol - REPLACE THIS WITH YOURS
//         'You have captured a zombie' // Token description - REPLACE THIS WITH YOURS
//     );
// }

export async function createTokenMetadata({
    connection,
    user,
    mint,
    name,
    symbol,
    description,
    assetPath,
    assetName,
}: {
    connection: web3.Connection;
    user: web3.Keypair;
    mint: web3.PublicKey;
    name: string;
    symbol: string;
    description: string;
    assetPath: string;
    assetName: string;
}) {
    // metaplex setup
    const metaplex = Metaplex.make(connection)
        .use(keypairIdentity(user))
        .use(
            bundlrStorage({
                address: 'https://devnet.bundlr.network',
                providerUrl: 'https://api.devnet.solana.com',
                timeout: 60000,
            })
        );

    // file to buffer
    const buffer = fs.readFileSync(assetPath);

    // buffer to metaplex file
    const file = toMetaplexFile(buffer, assetName);

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
