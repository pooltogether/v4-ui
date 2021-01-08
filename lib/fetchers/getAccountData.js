import { request } from 'graphql-request'

import { POOLTOGETHER_CURRENT_GRAPH_URIS } from 'lib/constants'
import { accountQuery } from 'lib/queries/accountQuery'

export const getAccountData = async (chainId, accountAddress, blockNumber) => {
  const query = accountQuery(blockNumber)

  const variables = {
    accountAddress,
  }

  let data
  try {
    data = await request(
      POOLTOGETHER_CURRENT_GRAPH_URIS[chainId],
      query,
      variables
    )
  } catch (error) {
    console.error(JSON.stringify(error, undefined, 2))
  }

  return data?.account
}
