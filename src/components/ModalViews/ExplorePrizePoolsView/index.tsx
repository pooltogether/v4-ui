import { BrowsePrizePoolsHeader } from '@components/BrowsePrizePools/BrowsePrizePoolsHeader'
import { BrowsePrizePoolsList } from '@components/BrowsePrizePools/BrowsePrizePoolsList'
import { HorizontalListByOdds } from '@components/BrowsePrizePools/PrizePoolHorizontalList/HorizontalListByOdds'
import { HorizontalListByTvl } from '@components/BrowsePrizePools/PrizePoolHorizontalList/HorizontalListByTvl'
import { useSelectedPrizePoolAddress } from '@hooks/useSelectedPrizePoolAddress'
import { Tabs, ViewProps } from '@pooltogether/react-components'
import { PrizePool } from '@pooltogether/v4-client-js'
import classNames from 'classnames'

const horizontalListMarginClassName = 'mb-12 -mx-2 xs:-mx-8 px-2 xs:px-8'

export const ExplorePrizePoolsView: React.FC<
  { onPrizePoolSelect?: (prizePool: PrizePool) => void } & ViewProps
> = (props) => {
  const { onPrizePoolSelect: _onPrizePoolSelect } = props
  const { setSelectedPrizePoolAddress } = useSelectedPrizePoolAddress()

  const onPrizePoolSelect = (prizePool: PrizePool) => {
    setSelectedPrizePoolAddress(prizePool)
    _onPrizePoolSelect?.(prizePool)
  }

  return (
    <div>
      <BrowsePrizePoolsHeader className='mb-12' />
      {/* TODO: Add a list of filtered prize pools by token holdings */}
      <Tabs
        titleClassName='mb-12'
        tabs={[
          {
            id: 'all-pools',
            view: (
              <>
                <BrowsePrizePoolsList onPrizePoolSelect={onPrizePoolSelect} />
              </>
            ),
            title: 'All Pools'
          },
          {
            id: 'top-pools',
            view: (
              <div className='flex flex-col space-y-12'>
                <HorizontalListByTvl
                  onPrizePoolSelect={onPrizePoolSelect}
                  marginClassName={horizontalListMarginClassName}
                />
                <HorizontalListByOdds
                  onPrizePoolSelect={onPrizePoolSelect}
                  marginClassName={horizontalListMarginClassName}
                />
              </div>
            ),
            title: 'Top Pools'
          }
        ]}
        initialTabId={'top-pools'}
      />
    </div>
  )
}

const Title = (props) => (
  <span {...props} className={classNames(props.className, 'font-bold text-lg')} />
)
