import { Handler } from '@netlify/functions'
import { testnet, mainnet } from '@pooltogether/v4-pool-data'
import { ethers } from 'ethers'
import fetch from 'cross-fetch'
import { isValidAddress, NETWORK } from '@pooltogether/utilities'
import { initializePrizeDistributors } from '@pooltogether/v4-js-client'

global.fetch = fetch

// Cloudflare KV
const CLOUDFLARE_ACCOUNT_IDENTIFIER = process.env.NEXT_JS_CLOUDFLARE_ACCOUNT_IDENTIFIER
const CLOUDFLARE_NAMESPACE_IDENTIFIER = process.env.NEXT_JS_CLOUDFLARE_NAMESPACE_IDENTIFIER
const CLOUDFLARE_BEARER_TOKEN = process.env.NEXT_JS_CLOUDFLARE_BEARER_TOKEN
const AUTH_HEADERS = Object.freeze({ Authorization: `Bearer ${CLOUDFLARE_BEARER_TOKEN}` })
// Infura
const INFURA_ID = process.env.NEXT_JS_INFURA_ID
// Validation
const SUPPORTED_NETWORKS = Object.freeze({
  mainnets: [NETWORK.mainnet, NETWORK.polygon],
  testnets: [NETWORK.rinkeby, NETWORK.mumbai]
})
const VALID_NETWORKS = [...SUPPORTED_NETWORKS['mainnets'], ...SUPPORTED_NETWORKS['testnets']]
// Response
const RESPONSE_HEADERS = Object.freeze({ 'Content-Type': 'application/json' })

/**
 * Path: /.netlify/functions/users-prizes
 * Required query params:
 * - usersAddress
 * - chainId
 * - prizeDistributorAddress
 * - drawId
 *
 * @param event
 * @param context
 * @returns
 */
const handler: Handler = async (event, context) => {
  try {
    const {
      usersAddress,
      chainId: _chainId,
      prizeDistributorAddress,
      drawId: _drawId
    } = event.queryStringParameters
    const chainId = Number(_chainId)
    const drawId = Number(_drawId)

    console.log('====================================')
    console.log('Params:', usersAddress, chainId, prizeDistributorAddress, drawId)
    console.log('====================================')

    await validateParameters(usersAddress, chainId, prizeDistributorAddress, drawId)

    // Create PrizeDistributor
    const contractList = getContractList(chainId)
    const chainIds = Array.from(new Set(contractList.contracts.map((c) => c.chainId)))
    console.log('chainIds', chainIds)
    const readProviders = getProviders(chainIds)
    const prizeDistributors = await initializePrizeDistributors(readProviders, contractList)
    const prizeDistributor = prizeDistributors.find(
      (cd) => cd.chainId === chainId && cd.address === prizeDistributorAddress
    )

    if (!prizeDistributor) {
      throw new Error(
        `Invalid Prize Distributor identifiers. chainId: ${chainId}, prizeDistributorAddress: ${prizeDistributorAddress}`
      )
    }

    // Get DrawResults
    const drawResults = await prizeDistributor.getUsersPrizesByDrawId(usersAddress, drawId)

    console.log('====================================')
    console.log('Draw Results:', JSON.stringify(drawResults))
    console.log('====================================')

    return {
      headers: {
        ...RESPONSE_HEADERS
      },
      statusCode: 200,
      body: JSON.stringify(drawResults)
    }
  } catch (e) {
    console.log(e.message)
    return {
      statusCode: 400,
      body: JSON.stringify({ error: e })
    }
  }
}

export { handler }

// Validation
const validateParameters = async (
  usersAddress: string,
  chainId: number,
  prizeDistributorAddress: string,
  drawId: number
) => {
  // Check chain id
  if (!VALID_NETWORKS.includes(chainId)) {
    throw new Error(
      `Invalid chain id ${chainId}. Supported chain ids: ${VALID_NETWORKS.join(', ')}`
    )
  } else if (!isValidAddress(usersAddress)) {
    throw new Error(`Invalid users address ${usersAddress}.`)
  } else if (!isValidAddress(prizeDistributorAddress)) {
    throw new Error(`Invalid users address ${prizeDistributorAddress}.`)
  }
}

// Ethers Providers

const POLYGON_INFURA_WEBSOCKETS_URL = `wss://polygon-mainnet.infura.io/ws/v3`

export const getProviders = (chainIds) => {
  const providers = {}
  chainIds.forEach((chainId) => {
    providers[chainId] = getProvider(chainId)
  })
  return providers
}

export const getProvider = (chainId) => {
  if ([NETWORK.mainnet, NETWORK.rinkeby].includes(chainId)) {
    return new ethers.providers.InfuraProvider(chainId, INFURA_ID)
  } else if (chainId === NETWORK.polygon) {
    return new ethers.providers.JsonRpcProvider(
      `${POLYGON_INFURA_WEBSOCKETS_URL}/${INFURA_ID}`,
      NETWORK.polygon
    )
  } else if (chainId === NETWORK.mumbai) {
    return new ethers.providers.JsonRpcProvider(
      'https://matic-mumbai.chainstacklabs.com',
      NETWORK.mumbai
    )
  } else {
    throw new Error('Unsupported chain id')
  }
}

// Contract List

/**
 * @param chainId
 * @returns
 */
const getContractList = (chainId) => {
  return SUPPORTED_NETWORKS['mainnets'].includes(chainId) ? mainnet : testnet
}

// Cloudflare KV

const getKVItem = async (key: string) => {
  return fetch(
    `https://api.cloudflare.com/client/v4/accounts/${CLOUDFLARE_ACCOUNT_IDENTIFIER}/storage/kv/namespaces/${CLOUDFLARE_NAMESPACE_IDENTIFIER}/values/${key}`,
    {
      headers: {
        ...AUTH_HEADERS
      }
    }
  )
}

const setKVItem = async (key: string, body: string) => {
  return fetch(
    `https://api.cloudflare.com/client/v4/accounts/${CLOUDFLARE_ACCOUNT_IDENTIFIER}/storage/kv/namespaces/${CLOUDFLARE_NAMESPACE_IDENTIFIER}/values/${key}`,

    {
      method: 'PUT',
      headers: {
        ...AUTH_HEADERS
      },
      body
    }
  )
}
