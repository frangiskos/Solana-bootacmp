use anchor_lang::prelude::*;

declare_id!("GycxrN6qouVxtSeSyp8JNJNswXqtJsSRMHwqU1WSfpAX");

#[program]
pub mod demo2 {
    use super::*;

    pub fn initialize(ctx: Context<Initialize>) -> Result<()> {
        Ok(())
    }
}

#[derive(Accounts)]
pub struct Initialize {}
