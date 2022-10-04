import { TransparentSelect } from '@components/Input/TransparentSelect'
import { OddsForDeposit } from '@components/PrizePoolNetwork/OddsForDeposit'
import { usePrizePoolsByOdds } from '@hooks/usePrizePoolsByOdds'
import { useSelectedPrizePoolAddress } from '@hooks/useSelectedPrizePoolAddress'
import { numberWithCommas } from '@pooltogether/utilities'
import { PrizePool } from '@pooltogether/v4-client-js'
import { useState } from 'react'
import { TopPool } from '.'
import { CardLabelLarge, CardLabelSmall } from '../../PrizePoolCard'

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
  const prizePool = prizePools?.[0]

  return (
    <TopPool
      className={className}
      isFetched={isFetched}
      title={'Best odds'}
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
              <option key={amount} value={amount}>
                ${numberWithCommas(amount, { precision: 0 })}
              </option>
            ))}
          </TransparentSelect>
        </div>
      }
      description={`Your odds to win at least one prize per day with a $${numberWithCommas(amount, {
        precision: 0
      })} deposit would be maximized here.`}
      prizePool={prizePool}
      onClick={(prizePool) => {
        if (!!onPrizePoolSelect) {
          onPrizePoolSelect(prizePool)
        } else {
          setSelectedPrizePoolAddress(prizePool)
        }
      }}
    >
      <div>
        <CardLabelSmall>Odds to win</CardLabelSmall>
        <CardLabelLarge>
          <OddsForDeposit prizePool={prizePool} amount={amount} />
        </CardLabelLarge>
      </div>
    </TopPool>
  )
}
