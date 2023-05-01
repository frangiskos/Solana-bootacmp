# RUST & ANCHOR RELATED STUFF

## Install Anchor

do this after you have installed rust

```bash
cargo install --git https://github.com/coral-xyz/anchor avm --locked --force
avm install latest
avm use latest
anchor --version
```

## Create Anchor project

    ```bash
    anchor init <project-name>
    cd <project-name>
    anchor keys list
    ```

Replace the key in `/src/lib.rs` & `/Anchor.toml` with the key you get above

## Test Anchor project

Preparation: Switch to local solana cluster

```bash
solana config get
solana config set --url localhost
```

Run tests

```bash
    anchor test
```

If the above command fails, try this instead

Terminal 1: Start local solana cluster

```bash
solana-test-validator
```

Terminal 2: Run tests

```bash
anchor build && anchor deploy && anchor test --skip-local-validator --skip-build --skip-deploy
```

This will 1. Spin up a local solana test validator 2. Build the program 3. Deploy the program to the local test validator 4. Run the tests in `/tests` folder
