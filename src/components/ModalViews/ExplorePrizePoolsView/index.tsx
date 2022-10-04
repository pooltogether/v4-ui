import { BrowsePrizePoolsHeader } from '@components/BrowsePrizePools/BrowsePrizePoolsHeader'
import { PrizePoolsTable } from '@components/BrowsePrizePools/PrizePoolsTable'
import { RecommendedPrizePools } from '@components/BrowsePrizePools/RecommendedPrizePools'
import { useSelectedPrizePoolAddress } from '@hooks/useSelectedPrizePoolAddress'
import { Tabs, ViewProps } from '@pooltogether/react-components'
import { PrizePool } from '@pooltogether/v4-client-js'
import classNames from 'classnames'

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
    <div className='pb-16 xs:pb-12'>
      <BrowsePrizePoolsHeader className='mb-8' />
      {/* TODO: Add a list of filtered prize pools by token holdings */}
      <Tabs
        titleClassName='mb-8'
        initialTabId={'all-pools'}
        tabs={[
          {
            id: 'all-pools',
            view: <PrizePoolsTable onPrizePoolSelect={onPrizePoolSelect} />,
            title: 'Prize Pools'
          },
          {
            id: 'top-pools',
            view: <RecommendedPrizePools onPrizePoolSelect={onPrizePoolSelect} />,
            title: 'Recommendations'
          }
        ]}
      />
    </div>
  )
}

const Title = (props) => (
  <span {...props} className={classNames(props.className, 'font-bold text-lg')} />
)
