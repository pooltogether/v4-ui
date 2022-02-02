import { JsonRpcProvider, TransactionResponse } from '@ethersproject/providers'
import { Contract } from 'ethers'

import TokenFaucetAbi from 'abis/TokenFaucet'

/**
 * Builds an ethers Contract and returns the function to claim rewards from a token faucet
 * @param provider
 * @param tokenFaucetAddress
 * @param usersAddress
 * @returns
 */
export const buildTokenFaucetClaimTx = (
  provider: JsonRpcProvider,
  tokenFaucetAddress: string,
  usersAddress: string
) => {
  const signer = provider.getSigner()
  const params = [usersAddress]
  const contract = new Contract(tokenFaucetAddress, TokenFaucetAbi, signer)
  const contractCall: () => Promise<TransactionResponse> = contract['claim'].bind(null, ...params)
  return contractCall
}
