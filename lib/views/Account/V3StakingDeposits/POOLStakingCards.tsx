import { TokenIcon } from '@pooltogether/react-components'
import { useTranslation } from 'react-i18next'

import { StakingCard } from './StakingCard'
import { useUsersAddress } from 'lib/hooks/useUsersAddress'
import { useUsersTokenFaucetRewards } from 'lib/hooks/v3/useUsersTokenFaucetRewards'
import { useUsersV3POOLPoolBalances } from 'lib/hooks/v3/useUsersV3POOLPoolBalances'
import { getTokenFaucetAddressTokenFaucetAddress } from './StakingBottomSheet'
import { useTokenFaucetData } from 'lib/hooks/v3/useTokenFaucetData'

export const POOLStakingCards = () => {
  const usersAddress = useUsersAddress()
  const { data, isFetched, refetch } = useUsersV3POOLPoolBalances(usersAddress)
  const { t } = useTranslation()

  if (!isFetched) {
    return null
  }

  return (
    <ul>
      {data.balances.map((balances) => {
        const chainId = balances.chainId
        const tokenFaucetAddress = getTokenFaucetAddressTokenFaucetAddress(
          chainId,
          balances.prizePool.addresses.prizePool
        )

        const { data: tokenFaucetData, isFetched: isTokenFaucetDataFetched } = useTokenFaucetData(
          chainId,
          tokenFaucetAddress,
          balances.prizePool,
          balances.token.usdPerToken
        )

        // NOTE: Assumes there is a single token faucet for the prize pool
        const { data: tokenFaucetRewards, isFetched: isTokenFaucetRewardsFetched } =
          useUsersTokenFaucetRewards(
            chainId,
            usersAddress,
            balances.prizePool,
            tokenFaucetAddress,
            balances.token.usdPerToken
          )

        return (
          <StakingCard
            key={`pool-staking-${chainId}-${balances.prizePool.addresses.prizePool}`}
            balances={balances}
            refetch={refetch}
            tokenLabel={balances.token.symbol}
            tokenIcon={
              <TokenIcon
                chainId={chainId}
                address={balances.token.address}
                sizeClassName='w-6 h-6'
              />
            }
            vapr={tokenFaucetData?.vapr}
            chainId={chainId}
            ticket={balances.ticket}
            tokenFaucetRewards={tokenFaucetRewards}
            isTokenFaucetRewardsFetched={isTokenFaucetRewardsFetched}
            isTokenFaucetDataFetched={isTokenFaucetDataFetched}
            poolEmoji={'🌡️'}
            colorFrom={'#46279A'}
            colorTo={'#7E46F2'}
            depositPrompt={t('poolPoolDepositDescription')}
          />
        )
      })}
    </ul>
  )
}
