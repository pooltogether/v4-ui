import { TokenIcon } from '@pooltogether/react-components'
import { useTranslation } from 'react-i18next'

import { StakingCard } from './StakingCard'
import { useUsersAddress } from '@hooks/useUsersAddress'
import { useUsersTokenFaucetRewards } from '@hooks/v3/useUsersTokenFaucetRewards'
import { useUsersV3POOLPoolBalances } from '@hooks/v3/useUsersV3POOLPoolBalances'
import { getTokenFaucetAddressTokenFaucetAddress } from './StakingBottomSheet'
import { useTokenFaucetData } from '@hooks/v3/useTokenFaucetData'
import { V3PrizePoolBalances } from '@hooks/v3/useAllUsersV3Balances'

export const POOLStakingCards = () => {
  const usersAddress = useUsersAddress()
  const { data, isFetched, refetch } = useUsersV3POOLPoolBalances(usersAddress)
  if (!isFetched) {
    return null
  }

  return (
    <ul>
      {data.balances.map((balances) => (
        <POOLStakingCard
          key={`POOL-staking-card-${balances.chainId}-${balances.ticket.address}`}
          balances={balances}
          refetch={refetch}
        />
      ))}
    </ul>
  )
}

const POOLStakingCard = (props: { balances: V3PrizePoolBalances; refetch: () => void }) => {
  const { balances, refetch } = props
  const chainId = balances.chainId
  const tokenFaucetAddress = getTokenFaucetAddressTokenFaucetAddress(
    chainId,
    balances.prizePool.addresses.prizePool
  )

  const { t } = useTranslation()
  const usersAddress = useUsersAddress()
  const { data: tokenFaucetData, isFetched: isTokenFaucetDataFetched } = useTokenFaucetData(
    chainId,
    tokenFaucetAddress,
    balances.prizePool,
    balances.token
  )

  // NOTE: Assumes there is a single token faucet for the prize pool
  const { data: tokenFaucetRewards, isFetched: isTokenFaucetRewardsFetched } =
    useUsersTokenFaucetRewards(
      chainId,
      usersAddress,
      balances.prizePool,
      tokenFaucetAddress,
      balances.token
    )

  return (
    <StakingCard
      balances={balances}
      refetch={refetch}
      tokenLabel={balances.token.symbol}
      tokenIcon={
        <TokenIcon chainId={chainId} address={balances.token.address} sizeClassName='w-6 h-6' />
      }
      vapr={tokenFaucetData?.vapr}
      chainId={chainId}
      tokenFaucetRewards={tokenFaucetRewards}
      isTokenFaucetRewardsFetched={isTokenFaucetRewardsFetched}
      isTokenFaucetDataFetched={isTokenFaucetDataFetched}
      poolEmoji={'🌡️'}
      colorFrom={'#46279A'}
      colorTo={'#7E46F2'}
      depositPrompt={t('poolPoolDepositDescription')}
    />
  )
}
