import { useSelectedPrizePoolAddress } from '@hooks/useSelectedPrizePoolAddress'
import { PrizePool } from '@pooltogether/v4-client-js'
import classNames from 'classnames'
import { useTranslation } from 'react-i18next'
import { PrizePoolCard, PrizePoolCardLoader } from '../../PrizePool/PrizePoolCard'

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
            onClick={async (prizePool) => {
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
          </>
        )}
      </ul>
    </div>
  )
}
