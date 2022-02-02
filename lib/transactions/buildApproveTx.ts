import { Token } from '@pooltogether/hooks'
import { JsonRpcProvider, TransactionResponse } from '@ethersproject/providers'
import { BigNumber, Contract } from 'ethers'

import Erc20Abi from 'abis/ERC20'

/**
 * Builds an ethers Contract and returns the function to approve spending of a token.
 * @param amountUnformatted
 * @param prizePoolAddress
 * @param provider
 * @param token
 * @returns
 */
export const buildApproveTx = (
  provider: JsonRpcProvider,
  amountUnformatted: BigNumber,
  prizePoolAddress: string,
  token: Token
) => {
  const signer = provider.getSigner()
  const params = [prizePoolAddress, amountUnformatted]
  const contract = new Contract(token.address, Erc20Abi, signer)
  const contractCall: () => Promise<TransactionResponse> = contract['approve'].bind(null, ...params)
  return contractCall
}
