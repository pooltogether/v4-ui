import { useQuery } from 'react-query'
import { isEmpty } from 'lodash'
import { podContractAddresses as allPodContractAddressesByChainId } from '@pooltogether/current-pool-data'
import { batch, contract } from '@pooltogether/etherplex'
import { usePodChainIds } from '@pooltogether/hooks'
import {
  addBigNumbers,
  calculateUsersOdds,
  deserializeBigNumbers,
  sToMs
} from '@pooltogether/utilities'

import PodAbi from 'abis/PodAbi'
import { formatUnits } from 'ethers/lib/utils'

const API_URI = 'https://pooltogether-api.com'

export const useAllPodsByChainId = (providersByChainId) => {
  const chainIds = usePodChainIds()

  const podContractAddressesByChainId = {}
  chainIds.map((chainId) => {
    podContractAddressesByChainId[chainId] = allPodContractAddressesByChainId[chainId]
  })

  const enabled = !isEmpty(providersByChainId)

  return useQuery(
    ['getPods', chainIds],
    () => getAllPods(podContractAddressesByChainId, providersByChainId),
    {
      refetchInterval: sToMs(30),
      enabled
    }
  )
}

const getAllPods = async (podContractAddressesByChainId, providersByChainId) => {
  let pods = await getPodsFromApi(podContractAddressesByChainId)
  pods = await getAllPodBalances(pods, providersByChainId)
  pods = deserializeBigNumbers(pods)
  pods = calculateAllPodsOdds(pods)

  return pods
}

/**
 * Fetches pods from PoolTogether API and organizes them into arrays keyed by chain id
 * @param {*} podAddressesByChainId
 * @returns
 */
const getPodsFromApi = async (podAddressesByChainId) => {
  const chainIds = Object.keys(podAddressesByChainId)
  const promiseSettledResult = await Promise.allSettled(
    chainIds.map((chainId) => getPodsFromApiByChainId(chainId, podAddressesByChainId[chainId]))
  )

  const podContractAddressesByChainId = await Promise.all(
    chainIds
      .map(async (chainId, index) => {
        const response = promiseSettledResult[index]
        if (response.status === 'fulfilled') {
          const pods = await response.value.json()
          return {
            chainId,
            pods
          }
        }
        return null
      })
      .filter(Boolean)
  )

  // Key pods by chain id
  const pods = {}
  podContractAddressesByChainId.map((podContractAddresses) => {
    pods[podContractAddresses.chainId] = podContractAddresses.pods
  })

  return pods
}

const getPodsFromApiByChainId = async (chainId, podContractAddresses) =>
  fetch(`${API_URI}/pods/${chainId}`)
// TODO: Actually query specific pod addresses
// fetch(`${API_URI}/pods/${chainId}?addresses=${podContractAddresses.join(',')}`)

const getAllPodBalances = async (podsByChainId, providersByChainId) => {
  const chainIds = Object.keys(podsByChainId)
  const podsWithBalancesResponse = await Promise.allSettled(
    chainIds.map((chainId) =>
      getPodBalances(chainId, providersByChainId[chainId], podsByChainId[chainId])
    )
  )
  const podsWithBalances = {}
  podsWithBalancesResponse.forEach((response) => {
    if (response.status === 'fulfilled') {
      const pods = response.value
      if (pods && pods.length > 0) {
        podsWithBalances[pods[0].metadata.chainId] = pods
      }
    }
  })
  return podsWithBalances
}

const getPodKey = (address) => `pod-${address}`

const getPodBalances = async (chainId, provider, pods) => {
  const batchCalls = []
  pods.map((pod) => {
    // Pod Shares
    const podContract = contract(getPodKey(pod.pod.address), PodAbi, pod.pod.address)

    batchCalls.push(podContract.totalSupply().getPricePerShare().balance().decimals())
  })

  const responses = await batch(provider, ...batchCalls)

  const podsWithBalance = pods.map((pod) => {
    const response = responses[getPodKey(pod.pod.address)]

    const decimals = response.decimals[0]
    const totalSupplyUnformatted = response.totalSupply[0]
    const totalSupply = formatUnits(totalSupplyUnformatted, decimals)
    const pricePerShareUnformatted = response.getPricePerShare[0]
    const pricePerShare = formatUnits(pricePerShareUnformatted, decimals)
    const balanceUnformatted = response.balance[0]
    const balance = formatUnits(balanceUnformatted, decimals)

    return {
      ...pod,
      pod: {
        ...pod.pod,
        decimals,
        totalSupplyUnformatted,
        totalSupply,
        pricePerShareUnformatted,
        pricePerShare,
        balanceUnformatted,
        balance
      }
    }
  })

  return podsWithBalance
}

const calculateAllPodsOdds = (podsByChainId) => {
  const chainIds = Object.keys(podsByChainId)
  const podsByChainIdWithOdds = {}
  chainIds.map((chainId) => {
    const pods = calculatePodsOdds(podsByChainId[chainId])
    podsByChainIdWithOdds[chainId] = pods
  })

  return podsByChainIdWithOdds
}

const calculatePodsOdds = (pods) =>
  pods.map((pod) => {
    const totalSupplyUnformatted = addBigNumbers([
      pod.tokens.ticket.totalSupplyUnformatted,
      pod.tokens.sponsorship.totalSupplyUnformatted
    ])
    const odds = calculateUsersOdds(
      pod.pod.balanceUnformatted,
      totalSupplyUnformatted,
      pod.tokens.underlyingToken.decimals,
      pod.prizePool.config.numberOfWinners
    )
    return { ...pod, pod: { ...pod.pod, odds } }
  })
