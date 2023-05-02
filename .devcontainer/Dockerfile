FROM ubuntu:20.04

WORKDIR /home/

COPY . .

RUN bash ./setup.sh

ENV PATH="/root/.cargo/bin:/root/.local/share/solana/install/active_release/bin:$PATH"
