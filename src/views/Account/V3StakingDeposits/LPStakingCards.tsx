import { TokenIcon } from '@pooltogether/react-components'
import { useTranslation } from 'react-i18next'
import { TokenWithBalance, TokenWithUsdBalance } from '@pooltogether/hooks'
import { amountMultByUsd, toScaledUsdBigNumber } from '@pooltogether/utilities'

import { StakingCard } from './StakingCard'
import { useUsersAddress } from '@src/hooks/useUsersAddress'
import { useUsersTokenFaucetRewards } from '@src/hooks/v3/useUsersTokenFaucetRewards'
import { getTokenFaucetAddressTokenFaucetAddress } from './StakingBottomSheet'
import { useTokenFaucetData } from '@src/hooks/v3/useTokenFaucetData'
import { V3PrizePoolBalances } from '@src/hooks/v3/useAllUsersV3Balances'
import { getLPPrizePoolMetadata, useLPTokenUsdValue } from '@src/hooks/v3/useLPTokenUsdValue'
import { useUsersV3LPPoolBalances } from '@src/hooks/v3/useUsersV3LPPoolBalances'
import { LPTokenIcon } from '@src/components/LPTokenIcon'
import { getAmountFromBigNumber } from '@src/utils/getAmountFromBigNumber'
import { BigNumber } from 'ethers'

export const LPStakingCards = () => {
  const usersAddress = useUsersAddress()
  const { data, isFetched, refetch } = useUsersV3LPPoolBalances(usersAddress)
  if (!isFetched) {
    return null
  }

  return (
    <ul>
      {data.balances.map((balances) => (
        <LPStakingCard
          key={`LP-staking-card-${balances.chainId}-${balances.ticket.address}`}
          balances={balances}
          refetch={refetch}
        />
      ))}
    </ul>
  )
}

const LPStakingCard = (props: { balances: V3PrizePoolBalances; refetch: () => void }) => {
  const { balances, refetch } = props
  const chainId = balances.chainId
  const tokenFaucetAddress = getTokenFaucetAddressTokenFaucetAddress(
    chainId,
    balances.prizePool.addresses.prizePool
  )

  const lpPrizePoolMetadata = getLPPrizePoolMetadata(balances.prizePool)

  const { data: lpTokenUsdValue, isFetched: isLPTokenUsdValueFetched } = useLPTokenUsdValue(
    balances.prizePool
  )

  const lpTokenWithUsdBalance = isLPTokenUsdValueFetched
    ? makeTokenWithUsdBalance(balances.token, lpTokenUsdValue)
    : null

  const { t } = useTranslation()
  const usersAddress = useUsersAddress()
  const { data: tokenFaucetData, isFetched: isTokenFaucetDataFetched } = useTokenFaucetData(
    chainId,
    tokenFaucetAddress,
    balances.prizePool,
    lpTokenWithUsdBalance
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
      tokenLabel={`${lpPrizePoolMetadata.tokens.underlyingToken.pair} ${lpPrizePoolMetadata.tokens.underlyingToken.symbol}`}
      tokenIcon={
        <LPTokenIcon
          chainId={chainId}
          sizeClassName='w-6 h-6'
          token1Address={lpPrizePoolMetadata.tokens.underlyingToken.token1.address}
          token2Address={lpPrizePoolMetadata.tokens.underlyingToken.token2.address}
        />
      }
      vapr={tokenFaucetData?.vapr}
      chainId={chainId}
      tokenFaucetRewards={tokenFaucetRewards}
      isTokenFaucetRewardsFetched={isTokenFaucetRewardsFetched}
      isTokenFaucetDataFetched={isTokenFaucetDataFetched}
      poolEmoji={'💎'}
      colorFrom={'#eC2BB8'}
      colorTo={'#EA69D6'}
      depositPrompt={t('lpDepositDescription')}
    />
  )
}

const makeTokenWithUsdBalance = (token: TokenWithBalance, usd: number): TokenWithUsdBalance => {
  const balanceUsdUnformatted = usd
    ? amountMultByUsd(token.amountUnformatted, usd)
    : BigNumber.from(0)
  const balanceUsd = getAmountFromBigNumber(balanceUsdUnformatted, token.decimals)
  const balanceUsdScaled = toScaledUsdBigNumber(balanceUsd.amount)
  return {
    ...token,
    balanceUsd,
    balanceUsdScaled,
    hasBalance: !token.amountUnformatted.isZero(),
    usdPerToken: usd
  }
}
