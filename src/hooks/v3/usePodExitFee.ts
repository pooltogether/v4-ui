import Erc20Abi from '@abis/ERC20'
import PodAbi from '@abis/V3_Pod'
import { Provider } from '@ethersproject/abstract-provider'
import { batch, contract } from '@pooltogether/etherplex'
import { getAmountFromUnformatted } from '@pooltogether/utilities'
import { useReadProvider } from '@pooltogether/wallet-connection'
import { BigNumber } from 'ethers'
import { useQuery } from 'react-query'

export const usePodExitFee = (
  chainId: number,
  podAddress: string,
  underlyingTokenAddress: string,
  amountToWithdrawUnformatted: BigNumber,
  decimals: string
) => {
  const provider = useReadProvider(chainId)

  return useQuery(
    ['usePodExitFee', chainId, podAddress, amountToWithdrawUnformatted?.toString()],
    () =>
      getPodExitFee(
        provider,
        podAddress,
        underlyingTokenAddress,
        amountToWithdrawUnformatted,
        decimals
      ),
    { enabled: Boolean(amountToWithdrawUnformatted) }
  )
}

const getPodExitFee = async (
  provider: Provider,
  podAddress: string,
  underlyingTokenAddress: string,
  amountToWithdrawUnformatted: BigNumber,
  decimals: string
) => {
  const batchCalls = []
  const podContract = contract(podAddress, PodAbi, podAddress)
  const underlyingTokenContract = contract(underlyingTokenAddress, Erc20Abi, underlyingTokenAddress)

  batchCalls.push(
    podContract.getEarlyExitFee(amountToWithdrawUnformatted),
    underlyingTokenContract.balanceOf(podAddress)
  )

  const response = await batch(provider, ...batchCalls)

  const float = getAmountFromUnformatted(response[underlyingTokenAddress].balanceOf[0], decimals)
  const exitFee = getAmountFromUnformatted(response[podAddress].getEarlyExitFee[0], decimals)

  return { decimals, float, exitFee }
}
