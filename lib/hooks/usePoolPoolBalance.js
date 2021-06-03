import { useQuery } from 'react-query'
import { POOLTOGETHER_SUBGRAPH_URIS } from '@pooltogether/current-pool-data'
import { useReadProvider } from 'lib/hooks/useReadProvider'
import { NETWORK } from '@pooltogether/utilities'
import { formatUnits } from '@ethersproject/units'
import { ethers } from 'ethers'
import request, { gql } from 'graphql-request'

import { CONTRACT_ADDRESSES, POOLPOOL_TICKET_CREATED_BLOCK, QUERY_KEYS } from 'lib/constants'
import { useGovernanceChainId } from 'lib/hooks/useGovernanceChainId'

export const usePoolPoolBalance = (usersAddress, blockNumber = -1) => {
  const chainId = useGovernanceChainId()
  const { readProvider, isLoaded: readProviderIsLoaded } = useReadProvider()

  const enabled = Boolean(readProviderIsLoaded && chainId === NETWORK.mainnet)
  return useQuery(
    [QUERY_KEYS.poolPoolBalance, usersAddress, chainId, blockNumber],
    () => getPoolPoolBalance(chainId, readProvider, usersAddress, blockNumber),
    { enabled }
  )
}

const getPoolPoolBalance = async (chainId, readProvider, usersAddress, blockNumber) => {
  try {
    // If the proposal was before the POOL Pool existed
    if (
      !Boolean(blockNumber) ||
      (blockNumber !== -1 && blockNumber < POOLPOOL_TICKET_CREATED_BLOCK)
    ) {
      return {
        amount: '0',
        amountUnformatted: ethers.constants.Zero,
        hasBalance: false,
        decimals: 17
      }
    }

    const blockFilter = blockNumber > 0 ? `, block: { number: ${blockNumber} }` : ''
    const query = gql`
          query POOLPoolBalance($id: String!) {
            controlledTokenBalance(id: $id ${blockFilter}) {
              balance
              controlledToken {
                decimals
              }
            }
          }
        `

    const variables = {
      id: `${usersAddress}-${CONTRACT_ADDRESSES[chainId].PoolPoolTicket}`
    }

    const data = await request(
      POOLTOGETHER_SUBGRAPH_URIS[NETWORK.mainnet]['3.3.2'],
      query,
      variables
    )

    const { controlledTokenBalance } = data

    if (!controlledTokenBalance) {
      return {
        amount: '0',
        amountUnformatted: ethers.constants.Zero,
        hasBalance: false,
        decimals: 17
      }
    }

    const { balance, controlledToken } = controlledTokenBalance
    const { decimals } = controlledToken

    const amountUnformatted = ethers.BigNumber.from(balance)

    console.log(blockNumber, {
      amount: formatUnits(amountUnformatted, decimals),
      amountUnformatted,
      hasBalance: !amountUnformatted.isZero(),
      decimals
    })

    return {
      amount: formatUnits(amountUnformatted, decimals),
      amountUnformatted,
      hasBalance: !amountUnformatted.isZero(),
      decimals
    }
  } catch (e) {
    return {
      amount: '0',
      amountUnformatted: ethers.constants.Zero,
      hasBalance: false,
      decimals: 17
    }
  }
}
