# Implementation Plan - Real EVM Transactions

The goal is to replace the mocked payment flow with real EVM transactions on Base Sepolia using USDC.

## User Review Required

> [!IMPORTANT]
> - Ensure your wallet has **Base Sepolia ETH** (for gas) and **USDC** (for payments).
> - You can get test tokens from [Alchemy Faucet](https://www.alchemy.com/faucets/base-sepolia) and USDC faucet.

## Proposed Changes

### Frontend (`groqService.js`)

- [ ] Update `initializePaymentFetch` to strictly restart if keys are missing
- [ ] Implement `evmSchemeClient.createPayment()` with real EIP-712 signing
- [ ] Ensure `viem` wallet client is correctly configured for signing

### Backend (`market-evm.js`)

- [ ] Import `@x402/evm` server-side validation libraries
- [ ] Implement `validatePayment` function to:
    - Decode the `x-402-payment` header
    - Verify the signature matches the expected amount and recipient
    - Submit the transaction to the blockchain (or verify it was submitted)

### Verification

- [ ] Test with a real wallet containing Base Sepolia ETH/USDC
- [ ] Confirm transaction appears on BaseScan

## Progress

- [x] Frontend Implementation (Real Transaction Submission)
- [ ] Backend Implementation (Transaction Verification)
- [ ] Verification
