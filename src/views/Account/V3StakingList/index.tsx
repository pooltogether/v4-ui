import { CurrencyValue } from '@components/CurrencyValue'
import { CardTitle } from '@components/Text/CardTitle'
import { useUsersV3LPPoolBalances } from '@hooks/v3/useUsersV3LPPoolBalances'
import { useUsersV3POOLPoolBalances } from '@hooks/v3/useUsersV3POOLPoolBalances'
import { getAmountFromUnformatted } from '@pooltogether/utilities'
import { CHAIN_ID, useUsersAddress } from '@pooltogether/wallet-connection'
import { BigNumber } from 'ethers'
import { useTranslation } from 'next-i18next'
import { useMemo } from 'react'
import { LPStakingCards } from './LPStakingCards'
import { POOLStakingCards } from './POOLStakingCards'
import { ExternalLinkWithWarning } from '../../../components/ExternalLinkWithWarning'
import { ListItem } from '../../../components/List/ListItem'
import { LPTokenIcon } from '../../../components/LPTokenIcon'
import { POOL_TOKEN, WETH_TOKEN } from '../../../constants/misc'

export const V3StakingList = () => {
  const usersAddress = useUsersAddress()
  const { t } = useTranslation()

  const { data: v3POOLPoolBalancesData, isFetched: isV3POOLPoolFetched } =
    useUsersV3POOLPoolBalances(usersAddress)
  const { data: v3LPPoolBalances, isFetched: isV3LPPoolFetched } =
    useUsersV3LPPoolBalances(usersAddress)

  const { isFetched, amount } = useMemo(() => {
    const v3POOLPoolTotalBalanceUsdScaled = isV3POOLPoolFetched
      ? v3POOLPoolBalancesData.totalValueUsdScaled
      : BigNumber.from(0)
    const v3LPPoolTotalBalanceUsdScaled = isV3LPPoolFetched
      ? v3LPPoolBalances.totalValueUsdScaled
      : BigNumber.from(0)

    const totalBalanceUsdScaled = v3POOLPoolTotalBalanceUsdScaled.add(v3LPPoolTotalBalanceUsdScaled)
    const amount = getAmountFromUnformatted(totalBalanceUsdScaled, '2')
    return {
      amount,
      isFetched: isV3POOLPoolFetched && isV3LPPoolFetched
    }
  }, [isV3POOLPoolFetched, isV3LPPoolFetched])

  if (!isFetched) return null

  return (
    <div className='flex flex-col space-y-2'>
      <CardTitle
        title={t('staking')}
        secondary={
          <CurrencyValue
            baseValue={amount.amount}
            options={{ minimumFractionDigits: 0, maximumFractionDigits: 0 }}
          />
        }
        loading={!isFetched}
      />
      <POOLStakingCards />
      <LPStakingCards />
      <ul>
        <ExternalLinkWithWarning
          left={
            <div className='flex space-x-2 items-center'>
              <LPTokenIcon
                className='flex'
                chainId={CHAIN_ID.mainnet}
                sizeClassName='w-6 h-6'
                token1Address={POOL_TOKEN[CHAIN_ID.mainnet]}
                token2Address={WETH_TOKEN[CHAIN_ID.mainnet]}
              />
              <span>Arrakis POOL/WETH</span>
            </div>
          }
          right={''}
          href='https://beta.arrakis.finance/vaults/137/0x8Ff0FF88797BE3a05e66456eC3CE8bFB96D6962C'
          twitter='ArrakisFinance'
          github='ArrakisFinance'
          repo='https://github.com/ArrakisFinance'
        />
      </ul>
    </div>
  )
}
