import { Token } from '@pooltogether/hooks'
import { JsonRpcProvider, TransactionResponse } from '@ethersproject/providers'
import { BigNumber, Contract, constants } from 'ethers'

import PrizePoolAbi from 'abis/V3_PrizePool'

/**
 * Builds an ethers Contract and returns the function to deposit to a v3 prize pool
 * @param provider
 * @param amountUnformatted
 * @param ticket
 * @param prizePoolAddress
 * @param usersAddress
 * @returns
 */
export const buildDepositTx = (
  provider: JsonRpcProvider,
  amountUnformatted: BigNumber,
  ticket: Token,
  prizePoolAddress: string,
  usersAddress: string
) => {
  const signer = provider.getSigner()
  const params = [usersAddress, amountUnformatted, ticket.address, constants.AddressZero]
  const contract = new Contract(prizePoolAddress, PrizePoolAbi, signer)
  const contractCall: () => Promise<TransactionResponse> = contract['depositTo'].bind(
    null,
    ...params
  )

  return contractCall
}
