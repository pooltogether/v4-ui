import { CardTitle } from '@components/Text/CardTitle'
import { useUsersAddress } from '@pooltogether/wallet-connection'
import { useTranslation } from 'react-i18next'
import { useAllChainFilteredPromotions } from '@hooks/v4/TwabRewards/useAllChainFilteredPromotions'
// import { POOLStakingCards } from './POOLStakingCards'

export const EarnRewardsCard = () => {
  const usersAddress = useUsersAddress()
  const { t } = useTranslation()

  const chainIds = useAllChainFilteredPromotions()

  console.log({ chainIds })

  return (
    <div className='flex flex-col space-y-2'>
      <CardTitle
        title={t('earnRewards')}
        // secondary={`$${amount.amountPretty}`}
        // loading={!isFetched}
      />
      {/* <POOLStakingCards /> */}
    </div>
  )
}
