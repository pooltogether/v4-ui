import { TransparentDiv } from '@components/TransparentDiv'
import { useSelectedChainId } from '@hooks/useSelectedChainId'
import { useSelectedPrizePool } from '@hooks/v4/PrizePool/useSelectedPrizePool'
import { useSelectedPrizePoolTokens } from '@hooks/v4/PrizePool/useSelectedPrizePoolTokens'
import { useUsersPrizePoolBalancesWithFiat } from '@hooks/v4/PrizePool/useUsersPrizePoolBalancesWithFiat'
import { CountUp, TokenIcon } from '@pooltogether/react-components'
import { getNetworkNiceNameByChainId } from '@pooltogether/utilities'
import { useUsersAddress } from '@pooltogether/wallet-connection'

export const BalanceHeader = () => {
  const { chainId } = useSelectedChainId()
  const { data: tokenData } = useSelectedPrizePoolTokens()
  const prizePool = useSelectedPrizePool()
  const usersAddress = useUsersAddress()
  const { data: balanceData } = useUsersPrizePoolBalancesWithFiat(usersAddress, prizePool)

  console.log({ balanceData })

  return (
    <TransparentDiv className='flex flex-col mt-5 rounded-xl px-2 xs:px-8 pb-2 xs:pb-2'>
      <TokenIcon
        address={tokenData?.token.address}
        chainId={chainId}
        className='mx-auto -mt-5 mb-2'
        sizeClassName='w-10 h-10'
      />
      <span className='mx-auto font-bold text-3xl'>
        $<CountUp countTo={balanceData?.balances.ticket.balanceUsd.amount} />
      </span>
      <span className='mx-auto font-bold opacity-70 text-xs space-x-2 mb-4'>
        <CountUp countTo={balanceData?.balances.ticket.amount} />
        <span>{balanceData?.balances.token.symbol}</span>
      </span>
      <ul>
        <li className='flex justify-between text-base'>
          <span>Network</span>
          <span>{getNetworkNiceNameByChainId(chainId)}</span>
        </li>
      </ul>
    </TransparentDiv>
  )
}
