import { Connection, PublicKey, Keypair } from '@solana/web3.js';
import { Metaplex, keypairIdentity, bundlrStorage, toMetaplexFile, NftWithToken } from '@metaplex-foundation/js';
import * as fs from 'fs-extra';

export async function nftDemos(connection: Connection, user: Keypair) {
    const tokenName = 'Alphabet Token';
    const description = 'Make your own ABCs with this token';
    const symbol = 'ABC';
    const sellerFeeBasisPoints = 100;
    const assetName = '#.png';
    const assetPath = './assets/ThreeDee2/#.png';
    const assetName2 = '_.png';
    const assetPath2 = './assets/ThreeDee2/_.png';

    const { uri, metaplex } = await getMetaplexUri(connection, user, assetName, assetPath, tokenName, description);

    await createNft({ metaplex, uri, tokenName, sellerFeeBasisPoints, symbol });

    // const { uri: uri2 } = await getMetaplexUri(connection, user, assetName2, assetPath2, tokenName, description);
    // // // You can get this from the Solana Explorer URL
    // const mintAddress = new PublicKey('EPd324PkQx53Cx2g2B9ZfxVmu6m6gyneMaoWTy2hk2bW');
    // await updateNft({ metaplex, uri: uri2, tokenName, sellerFeeBasisPoints, symbol, mintAddress });
}

async function getMetaplexUri(
    connection: Connection,
    user: Keypair,
    assetName: string,
    assetPath: string,
    tokenName: string,
    description: string
) {
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

    const { uri } = await metaplex.nfts().uploadMetadata({
        name: tokenName,
        description: description,
        image: imageUri,
    });

    console.log('metadata uri:', uri);

    return { uri, metaplex };
}

async function createNft({
    metaplex,
    uri,
    tokenName,
    sellerFeeBasisPoints,
    symbol,
}: {
    metaplex: Metaplex;
    uri: string;
    tokenName: string;
    sellerFeeBasisPoints: number;
    symbol: string;
}): Promise<NftWithToken> {
    const { nft } = await metaplex.nfts().create({
        uri: uri,
        name: tokenName,
        sellerFeeBasisPoints: sellerFeeBasisPoints,
        symbol: symbol,
    });

    console.log(`Token Mint: https://explorer.solana.com/address/${nft.address.toString()}?cluster=devnet`);

    return nft;
}

async function updateNft({
    metaplex,
    uri,
    tokenName,
    sellerFeeBasisPoints,
    symbol,
    mintAddress,
}: {
    metaplex: Metaplex;
    uri: string;
    tokenName: string;
    sellerFeeBasisPoints: number;
    symbol: string;
    mintAddress: PublicKey;
}) {
    // get "NftWithToken" type from mint address
    const nft = await metaplex.nfts().findByMint({ mintAddress });

    // omit any fields to keep unchanged
    await metaplex.nfts().update({
        nftOrSft: nft,
        name: tokenName,
        symbol: symbol,
        uri: uri,
        sellerFeeBasisPoints: sellerFeeBasisPoints,
    });

    console.log(`Token Mint: https://explorer.solana.com/address/${nft.address.toString()}?cluster=devnet`);
}
