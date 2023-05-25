## update and install some things we should probably have
apt-get update
apt-get install -y \
  curl \
  wget \
  git \
  gnupg2 \
  jq \
  sudo \
  zsh \
  vim \
  nano \
  build-essential \
  openssl
  
## update and install 2nd level of packages
apt-get install -y pkg-config

## Install NodeJS
# apt-get install curl
curl -sL https://deb.nodesource.com/setup_20.x | sudo -E bash -
apt-get install -y nodejs
node -v
npm -v

## Install Yarn
apt remove cmdtest -y
corepack enable
corepack prepare yarn@stable --activate

## Install rustup and common components
curl https://sh.rustup.rs -sSf | sh -s -- -y
export PATH="/root/.cargo/bin:$PATH"

rustup install nightly
rustup component add rustfmt
rustup component add rustfmt --toolchain nightly
rustup component add clippy 
rustup component add clippy --toolchain nightly

cargo install cargo-expand
cargo install cargo-edit
cargo install just
cargo install cargo-workspaces

## Install Solana
sh -c "$(curl -sSfL https://release.solana.com/stable/install)"
export PATH="/root/.local/share/solana/install/active_release/bin:$PATH"
solana --version

## Configure Solana
solana-keygen new -f -s --no-bip39-passphrase -o /root/.config/solana/id.json
solana config set --keypair ~/.config/solana/id.json
solana config set --url https://metaplex.devnet.rpcpool.com/
solana airdrop 2
solana address
solana balance


## Install Anchor
cargo install --git https://github.com/coral-xyz/anchor avm --locked --force
avm install latest
avm use latest
anchor --version


## setup and install oh-my-zsh
sh -c "$(curl -fsSL https://raw.githubusercontent.com/robbyrussell/oh-my-zsh/master/tools/install.sh)"
cp -R /root/.oh-my-zsh /home/$USERNAME
cp /root/.zshrc /home/$USERNAME
sed -i -e "s/\/root\/.oh-my-zsh/\/home\/$USERNAME\/.oh-my-zsh/g" /home/$USERNAME/.zshrc
chown -R $USER_UID:$USER_GID /home/$USERNAME/.oh-my-zsh /home/$USERNAME/.zshrc
