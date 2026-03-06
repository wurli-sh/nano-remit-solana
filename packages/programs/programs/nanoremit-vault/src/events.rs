use anchor_lang::prelude::*;

#[event]
pub struct Deposited {
    pub user: Pubkey,
    pub nft_mint: Pubkey,
}

#[event]
pub struct Borrowed {
    pub user: Pubkey,
    pub amount: u64,
    pub total_debt: u64,
}

#[event]
pub struct Repaid {
    pub user: Pubkey,
    pub amount: u64,
    pub remaining_debt: u64,
}

#[event]
pub struct Withdrawn {
    pub user: Pubkey,
    pub nft_mint: Pubkey,
}

#[event]
pub struct TierUpdated {
    pub user: Pubkey,
    pub old_tier: u8,
    pub new_tier: u8,
}
