use anchor_lang::prelude::*;

declare_id!("GAWkZmby7R7jX7LcJEUUsvrJuEJ7VZ2eugDH3snPoM4P");

// Program's instruction logic.
#[program]
pub mod demo1 {
    use super::*;

    pub fn initialize(_ctx: Context<Initialize>) -> Result<()> {
        msg!("Hello world!");
        Ok(())
    }

    // pub fn second_instruction(ctx: Context<SecondInstruction>) -> Result<()> {
    //     Ok(())
    // }
}

// Account validation.
#[derive(Accounts)]
pub struct Initialize {}

// Account structure.
pub struct Counter {
    count: u8,
}
