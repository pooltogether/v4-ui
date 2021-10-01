import { Handler } from '@netlify/functions'
import { testnets } from '@pooltogether/v4-pool-data'
import { ethers } from 'ethers'

import { initializeDrawPrizes } from '@pooltogether/v4-js-client'

import fetch from 'cross-fetch'
global.fetch = fetch

// Cloudflare KV
const CLOUDFLARE_ACCOUNT_IDENTIFIER = process.env.NEXT_JS_CLOUDFLARE_ACCOUNT_IDENTIFIER
const CLOUDFLARE_NAMESPACE_IDENTIFIER = process.env.NEXT_JS_CLOUDFLARE_NAMESPACE_IDENTIFIER
const CLOUDFLARE_BEARER_TOKEN = process.env.NEXT_JS_CLOUDFLARE_BEARER_TOKEN
const AUTH_HEADERS = Object.freeze({ Authorization: `Bearer ${CLOUDFLARE_BEARER_TOKEN}` })
// Infura
const INFURA_ID = process.env.NEXT_JS_INFURA_ID
// Other constants
// const VALID_CHAIN_IDS = [NETWORK]

/**
 * Path: /.netlify/functions/users-prizes-background
 * Required query params:
 * - usersAddress
 * - chainId
 * - claimableDrawAddress
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
      claimableDrawAddress,
      drawId: _drawId
    } = event.queryStringParameters
    const chainId = Number(_chainId)
    const drawId = Number(_drawId)
    // console.log('Params:', usersAddress, chainId, claimableDrawAddress, drawId)

    // TODO: Validate params

    // TODO: Check KV
    const test = await getKVItem('test')
    // console.log('TEST', test)
    const d = await test.text()
    // console.log('DATA', d)

    await setKVItem('iPhone', 'iPhone')

    // TODO: Fetch new data
    // const contractList = getContractList(chainId)
    // const chainIds = Array.from(new Set(contractList.contracts.map((c) => c.chainId)))
    // console.log('chainIds', chainIds)
    // const readProviders = getProviders(chainIds)
    // let r = await readProviders[4].getNetwork()
    // const drawPrizes = await initializeDrawPrizes(readProviders, contractList)
    // const drawPrize = drawPrizes.find(
    //   (cd) => cd.chainId === chainId && cd.address === claimableDrawAddress
    // )

    // TODO: Store draw results in KV
    // const drawResults = await drawPrize.getUsersPrizesByDrawId(usersAddress, drawId)
    // console.log('drawResults', drawResults)

    return {
      statusCode: 200,
      body: 'hi'
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
  if ([1, 4].includes(chainId)) {
    return new ethers.providers.InfuraProvider(chainId, INFURA_ID)
  } else if (chainId === 137) {
    return new ethers.providers.JsonRpcProvider(
      `${POLYGON_INFURA_WEBSOCKETS_URL}/${INFURA_ID}`,
      137
    )
  } else if (chainId === 80001) {
    return new ethers.providers.JsonRpcProvider('https://matic-mumbai.chainstacklabs.com', 80001)
  } else {
    throw new Error('Unsupported chain id')
  }
}

// Contract List

const getContractList = (chainId) => {
  return testnets
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
