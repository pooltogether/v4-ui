import TokenFaucetAbi from '@abis/TokenFaucet'
import { Signer } from '@ethersproject/abstract-signer'
import { TransactionResponse } from '@ethersproject/providers'
import { Contract } from 'ethers'

/**
 * Builds an ethers Contract and returns the function to claim rewards from a token faucet
 * @param signer
 * @param tokenFaucetAddress
 * @param usersAddress
 * @returns
 */
export const buildTokenFaucetClaimTx = (
  signer: Signer,
  tokenFaucetAddress: string,
  usersAddress: string
) => {
  const params = [usersAddress]
  const contract = new Contract(tokenFaucetAddress, TokenFaucetAbi, signer)
  const contractCall: () => Promise<TransactionResponse> = contract['claim'].bind(null, ...params)
  return contractCall
}
