import { TransparentDiv } from '@components/TransparentDiv'
import { useSelectedChainId } from '@hooks/useSelectedChainId'
import { useGaugeController } from '@hooks/v4/Gauge/useGaugeControllers'
import { useGaugeToken } from '@hooks/v4/Gauge/useGaugeToken'
import { useUsersGaugeBalance } from '@hooks/v4/Gauge/useUsersGaugeBalance'
import { usePrizeDistributorByChainId } from '@hooks/v4/PrizeDistributor/usePrizeDistributorByChainId'
import { useSelectedPrizePool } from '@hooks/v4/PrizePool/useSelectedPrizePool'
import { useSelectedPrizePoolTokens } from '@hooks/v4/PrizePool/useSelectedPrizePoolTokens'
import { CountUp, TokenIcon } from '@pooltogether/react-components'
import { getNetworkNiceNameByChainId, shorten } from '@pooltogether/utilities'
import { useUsersAddress } from '@pooltogether/wallet-connection'
import { getAmountFromBigNumber } from '@utils/getAmountFromBigNumber'

export const GaugeHeader = () => {
  const { chainId } = useSelectedChainId()
  const { data: tokenData } = useSelectedPrizePoolTokens()
  const prizePool = useSelectedPrizePool()
  const { data: tokens } = useSelectedPrizePoolTokens()
  const usersAddress = useUsersAddress()
  const prizeDistributor = usePrizeDistributorByChainId(prizePool.chainId)
  const { data: gaugeController } = useGaugeController(prizeDistributor)
  const { data: token } = useGaugeToken(gaugeController)
  const { data: gaugeBalance } = useUsersGaugeBalance(
    usersAddress,
    tokens?.ticket.address,
    gaugeController
  )
  const balance = getAmountFromBigNumber(gaugeBalance, token?.decimals)

  return (
    <TransparentDiv className='flex flex-col mt-5 rounded-xl px-2 xs:px-8 pb-2 xs:pb-2'>
      <TokenIcon
        address={tokenData?.token.address}
        chainId={chainId}
        className='mx-auto -mt-5 mb-2'
        sizeClassName='w-10 h-10'
      />
      <span className='mx-auto font-bold text-3xl'>
        <CountUp countTo={balance.amount} />
      </span>
      <span className='mx-auto font-bold opacity-70 text-xs space-x-2 mb-4'>
        <span>{token?.symbol}</span>
      </span>
      <ul>
        <li className='flex justify-between text-base'>
          <span>Network</span>
          <span>{getNetworkNiceNameByChainId(chainId)}</span>
        </li>
        <li className='flex justify-between text-base'>
          <span>Prize Pool</span>
          <span>{shorten({ hash: prizePool.address })}</span>
        </li>
      </ul>
    </TransparentDiv>
  )
}
