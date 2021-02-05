import { batch, contract } from '@pooltogether/etherplex'
import { useContext } from 'react'
import { useQuery } from 'react-query'
import { ethers } from 'ethers'

import MerkleDistributorAbi from 'abis/MerkleDistributor'
import { axiosInstance } from 'lib/axiosInstance'
import { AuthControllerContext } from 'lib/components/contextProviders/AuthControllerContextProvider'
import { CONTRACT_ADDRESSES, QUERY_KEYS } from 'lib/constants'
import { useReadProvider } from 'lib/hooks/useReadProvider'

export const useClaimablePoolFromRetroactiveDistribution = () => {
  const { usersAddress, pauseQueries, chainId } = useContext(AuthControllerContext)
  const { readProvider, isLoaded: readProviderIsLoaded } = useReadProvider()

  return useQuery(
    [QUERY_KEYS.retroactivePoolClaimDataQuery, usersAddress, chainId],
    async () => {
      return getClaimablePoolFromRetroactiveDistribution(readProvider, chainId, usersAddress)
    },
    {
      // TODO: Remove chainId === 4
      enabled: usersAddress && !pauseQueries && readProviderIsLoaded && chainId === 4,
      refetchInterval: false
    }
  )
}

const getClaimablePoolFromRetroactiveDistribution = async (provider, chainId, usersAddress) => {
  const checksummedAddress = ethers.utils.getAddress(usersAddress)

  if (!Boolean(process.env.NEXT_JS_FEATURE_FLAG_CLAIM)) {
    return {
      isClaimed: true,
      amount: 0,
      formattedAmount: 0
    }
  }

  try {
    const response = await getMerkleDistributionData(checksummedAddress, chainId)
    const merkleDistributionData = response.data

    const isClaimed = await getIsClaimed(provider, chainId, merkleDistributionData.index)

    return {
      ...merkleDistributionData,
      amountBN: ethers.utils.bigNumberify(merkleDistributionData.amount),
      amount: Number(
        ethers.utils.formatUnits(
          ethers.utils.bigNumberify(merkleDistributionData.amount).toString(),
          18
        )
      ),
      isClaimed
    }
  } catch (e) {
    console.log(e.message)
    return {
      isClaimed: true,
      amount: 0,
      formattedAmount: 0
    }
  }
}

const getMerkleDistributionData = async (usersAddress, chainId) => {
  return await axiosInstance.get(
    `https://objective-jang-89749c.netlify.app/.netlify/functions/merkleAddressData?address=${usersAddress}${chainId ===
      4 && '&chainId=4'}`
  )
}

const getIsClaimed = async (provider, chainId, index) => {
  // TODO: Add ChainID to the request so we can get still do this on rinkeby
  const merkleDistributorContract = contract(
    'merkleDistributor',
    MerkleDistributorAbi,
    CONTRACT_ADDRESSES[chainId].MerkleDistributor
  )
  const { merkleDistributor } = await batch(provider, merkleDistributorContract.isClaimed(index))

  return merkleDistributor.isClaimed[0]
}
