import { InfoListItem } from '@components/InfoList'
import { UpdatedPrizePoolOddsListItem } from '@components/InfoList/UpdatedPrizePoolOddsListItem'
import { TransparentDiv } from '@components/TransparentDiv'
import { useSelectedChainId } from '@hooks/useSelectedChainId'
import { usePrizePoolExpectedPrizes } from '@hooks/v4/PrizePool/usePrizePoolExpectedPrizes'
import { useSelectedPrizePool } from '@hooks/v4/PrizePool/useSelectedPrizePool'
import { useSelectedPrizePoolTokens } from '@hooks/v4/PrizePool/useSelectedPrizePoolTokens'
import { useUsersPrizePoolBalancesWithFiat } from '@hooks/v4/PrizePool/useUsersPrizePoolBalancesWithFiat'
import { usePrizePoolTicketTotalSupply } from '@hooks/v4/TwabRewards/usePrizePoolTicketTotalSupply'
import { CountUp, NetworkIcon, TokenIcon } from '@pooltogether/react-components'
import { getNetworkNiceNameByChainId } from '@pooltogether/utilities'
import { useUsersAddress } from '@pooltogether/wallet-connection'

export const BalanceHeader = () => {
  const { chainId } = useSelectedChainId()
  const { data: tokenData } = useSelectedPrizePoolTokens()
  const prizePool = useSelectedPrizePool()
  const usersAddress = useUsersAddress()
  const { data: balanceData } = useUsersPrizePoolBalancesWithFiat(usersAddress, prizePool)
  const { data: prizePoolTicketTotalSupply } = usePrizePoolTicketTotalSupply(prizePool)
  const { data: prizePoolExpectedPrizes } = usePrizePoolExpectedPrizes(prizePool)

  return (
    <TransparentDiv className='flex flex-col mt-5 rounded-xl px-4 sm:px-6 lg:px-12 pb-2 xs:pb-2'>
      <TokenIcon
        address={tokenData?.token.address}
        chainId={chainId}
        className='mx-auto -mt-5 mb-2'
        sizeClassName='w-10 h-10'
      />
      <span className='mx-auto font-bold text-3xl'>
        $<CountUp countTo={balanceData?.balances.ticket.balanceUsd.amount} />
      </span>
      <div className='flex items-center mx-auto font-bold opacity-70 text-xs space-x-2 mb-4'>
        <TokenIcon chainId={chainId} address={balanceData?.balances.ticket.address} />
        <CountUp countTo={balanceData?.balances.ticket.amount} />
        <span>{balanceData?.balances.ticket.symbol}</span>
      </div>
      <ul className='space-y-1 pb-2 px-2 xs:px-0'>
        <InfoListItem
          label={'Network'}
          value={
            <div className='flex items-center space-x-1'>
              <NetworkIcon chainId={chainId} />
              <span>{getNetworkNiceNameByChainId(chainId)}</span>
            </div>
          }
        />
        <UpdatedPrizePoolOddsListItem prizePool={prizePool} />
        <InfoListItem
          label={'Daily Prizes'}
          value={
            <div className='flex items-center space-x-1'>
              <span>{Math.round(prizePoolExpectedPrizes?.expectedTotalNumberOfPrizes)}</span>
            </div>
          }
        />
        <InfoListItem
          label={'TVL'}
          value={
            <div className='flex items-center space-x-1'>
              <TokenIcon chainId={chainId} address={tokenData?.token.address} />
              <span>{`${prizePoolTicketTotalSupply?.amount.amountPretty}`}</span>
            </div>
          }
        />
      </ul>
    </TransparentDiv>
  )
}
