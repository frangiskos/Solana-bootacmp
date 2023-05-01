use anchor_lang::prelude::*;

declare_id!("JUM2T3uHhcjeGNFdrpDnQ3gfP8Fa4jfgikMVReundXG");

#[program]
pub mod nft_staking_demo {
    use super::*;

    pub fn initialize(ctx: Context<Initialize>) -> Result<()> {
        Ok(())
    }
}

#[derive(Accounts)]
pub struct Initialize {}
