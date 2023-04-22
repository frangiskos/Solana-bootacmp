# The candy machine sample

## What you'll need

The Solana CLI
The Sugar CLI

## Getting started

```bash
solana config set --url devnet
solana-keygen new --outfile ~/.config/solana/devnet.json
solana airdrop 2
solana balance
```

## Create the collection using the CLI

### Create the collection

    ```bash
    sugar launch
    ```

### Mint the NFTs

```bash
sugar mint
```

save the Candy machine ID into the .env of the frontend

## Create the frontend

git clone https://github.com/metaplex-foundation/candy-machine-ui
cd candy-machine-ui && npm install
rename .env.example to .env and add the Candy machine ID
