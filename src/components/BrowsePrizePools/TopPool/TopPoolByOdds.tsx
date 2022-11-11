import { TransparentSelect } from '@components/Input/TransparentSelect'
import { OddsForDeposit } from '@components/PrizePoolNetwork/OddsForDeposit'
import { usePrizePoolsByOdds } from '@hooks/usePrizePoolsByOdds'
import { useSelectedPrizePoolAddress } from '@hooks/useSelectedPrizePoolAddress'
import { formatCurrencyNumberForDisplay, numberWithCommas } from '@pooltogether/utilities'
import { PrizePool } from '@pooltogether/v4-client-js'
import { useTranslation } from 'next-i18next'
import { useState } from 'react'
import { TopPool } from '.'
import { CardLabelLarge, CardLabelSmall } from '../../PrizePool/PrizePoolCard'

const AMOUNT_OPTIONS = Object.freeze(['10', '100', '1000', '10000'])

export const TopPoolByOdds: React.FC<{
  className?: string
  onPrizePoolSelect?: (prizePool: PrizePool) => void
  marginClassName?: string
}> = (props) => {
  const { onPrizePoolSelect, className } = props
  const [amount, setAmount] = useState('1000')
  const { setSelectedPrizePoolAddress } = useSelectedPrizePoolAddress()
  const { isFetched, prizePools } = usePrizePoolsByOdds(amount, '6')
  const { t } = useTranslation()
  const prizePool = prizePools?.[0]

  return (
    <TopPool
      className={className}
      isFetched={isFetched}
      title={t('bestChanceToWin')}
      secondaryTitle={
        <div className='flex items-center space-x-1 text-xs'>
          <span>per</span>
          <TransparentSelect
            name='amount'
            id='amount'
            onChange={(event) => setAmount(event.target.value)}
            value={amount}
          >
            {AMOUNT_OPTIONS.map((amount) => (
              <option key={amount} value={amount} className='dark:bg-pt-purple'>
                ${numberWithCommas(amount, { precision: 0 })}
              </option>
            ))}
          </TransparentSelect>
        </div>
      }
      description={t('bestChanceToWinDescription', {
        amount: formatCurrencyNumberForDisplay(amount, 'usd')
      })}
      prizePool={prizePool}
      onClick={async (prizePool) => {
        if (!!onPrizePoolSelect) {
          onPrizePoolSelect(prizePool)
        } else {
          setSelectedPrizePoolAddress(prizePool)
        }
      }}
    >
      <div>
        <CardLabelSmall>{t('frequencyChanceToWin', { frequency: t('daily') })}</CardLabelSmall>
        <CardLabelLarge>
          <OddsForDeposit prizePool={prizePool} amount={amount} />
        </CardLabelLarge>
      </div>
    </TopPool>
  )
}
