import { usePrizePoolsByTvl } from '@hooks/usePrizePoolsByTvl'
import { useSelectedPrizePoolAddress } from '@hooks/useSelectedPrizePoolAddress'
import { useSelectedPrizePool } from '@hooks/v4/PrizePool/useSelectedPrizePool'
import { PrizePool } from '@pooltogether/v4-client-js'
import { addPropsToChildren } from '@utils/addProps'
import classNames from 'classnames'
import { cloneElement } from 'react'
import { useTranslation } from 'react-i18next'
import { PrizePoolCard, PrizePoolCardLoader, TotalValueLocked } from '../../PrizePoolCard'

/**
 * Defaults to setting selected prize pool address globally
 * @param props
 * @returns
 */
export const PrizePoolHorizontalList: React.FC<{
  prizePools: PrizePool[]
  prizePoolCardContent: React.FC<{ prizePool }>
  label: string
  isPartiallyFetched?: boolean
  isFetched?: boolean
  className?: string
  marginClassName?: string
  onPrizePoolSelect?: (prizePool: PrizePool) => void
}> = (props) => {
  const {
    isPartiallyFetched,
    isFetched,
    prizePools,
    prizePoolCardContent,
    label,
    onPrizePoolSelect,
    className,
    marginClassName
  } = props
  const { setSelectedPrizePoolAddress } = useSelectedPrizePoolAddress()
  const { t } = useTranslation()

  return (
    <div
      className={classNames('overflow-x-auto minimal-scrollbar pb-2', className, marginClassName)}
    >
      <ul className={classNames('space-x-4 flex w-max')}>
        {prizePools?.map((prizePool) => (
          <PrizePoolCard
            key={`${label}-horizontal-pools-list-${prizePool.id()}`}
            prizePool={prizePool}
            onClick={(prizePool) => {
              console.log('onClick', onPrizePoolSelect, prizePool)
              if (!!onPrizePoolSelect) {
                onPrizePoolSelect(prizePool)
              } else {
                setSelectedPrizePoolAddress(prizePool)
              }
            }}
          >
            {prizePoolCardContent({ prizePool })}
          </PrizePoolCard>
        ))}
        {!isFetched && (
          <>
            <PrizePoolCardLoader />
          </>
        )}
        {!isPartiallyFetched && (
          <>
            <PrizePoolCardLoader />
            <PrizePoolCardLoader />
          </>
        )}
      </ul>
    </div>
  )
}
