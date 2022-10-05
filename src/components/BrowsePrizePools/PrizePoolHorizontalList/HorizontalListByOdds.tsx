import { TransparentSelect } from '@components/Input/TransparentSelect'
import { usePrizePoolsByOdds } from '@hooks/usePrizePoolsByOdds'
import { numberWithCommas } from '@pooltogether/utilities'
import { PrizePool } from '@pooltogether/v4-client-js'
import classNames from 'classnames'
import { useState } from 'react'
import { PrizePoolHorizontalList } from '.'
import { NetworkOddsForDepositGroup } from '../../PrizePoolCard'

const AMOUNT_OPTIONS = Object.freeze(['10', '100', '1000', '10000'])

export const HorizontalListByOdds: React.FC<{
  className?: string
  onPrizePoolSelect?: (prizePool: PrizePool) => void
  marginClassName?: string
}> = (props) => {
  const { onPrizePoolSelect, className, marginClassName } = props
  const [amount, setAmount] = useState('1000')
  const { isPartiallyFetched, isFetched, prizePools } = usePrizePoolsByOdds(amount, '6')

  return (
    <div className={classNames(className, 'space-y-2')}>
      <div className='flex justify-between'>
        <span className='font-bold text-lg'>Best odds</span>
        <div className='flex items-center space-x-1'>
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
      </div>
      <PrizePoolHorizontalList
        label='by-odds'
        marginClassName={marginClassName}
        onPrizePoolSelect={onPrizePoolSelect}
        prizePools={prizePools}
        isPartiallyFetched={isPartiallyFetched}
        isFetched={isFetched}
        prizePoolCardContent={({ prizePool }) => (
          <NetworkOddsForDepositGroup prizePool={prizePool} amount={amount} decimals='6' />
        )}
      />
    </div>
  )
}
