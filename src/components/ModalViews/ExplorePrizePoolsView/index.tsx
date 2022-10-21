import { PrizePoolsTable } from '@components/BrowsePrizePools/PrizePoolsTable'
import { RecommendedPrizePools } from '@components/BrowsePrizePools/RecommendedPrizePools'
import { URL_QUERY_KEY } from '@constants/urlQueryKeys'
import { useQueryParamState } from '@hooks/useQueryParamState'
import { useSelectedPrizePoolAddress } from '@hooks/useSelectedPrizePoolAddress'
import { Tabs, ViewProps } from '@pooltogether/react-components'
import { PrizePool } from '@pooltogether/v4-client-js'
import classNames from 'classnames'
import { ExplorePrizePoolsHeader } from './ExplorePrizePoolsHeader'

/**
 * TODO: Add a list of filtered prize pools by token holdings
 * @param props
 * @returns
 */
export const ExplorePrizePoolsView: React.FC<
  { onPrizePoolSelect?: (prizePool: PrizePool) => void } & ViewProps
> = (props) => {
  const { onPrizePoolSelect: _onPrizePoolSelect } = props
  const { setSelectedPrizePoolAddress } = useSelectedPrizePoolAddress()

  const onPrizePoolSelect = async (prizePool: PrizePool) => {
    setSelectedPrizePoolAddress(prizePool)
    _onPrizePoolSelect?.(prizePool)
  }

  const { data: initialTabId, setData } = useQueryParamState(URL_QUERY_KEY.exploreView, 'top', [
    'all',
    'top'
  ])

  return (
    <div className='pb-16 xs:pb-12'>
      <ExplorePrizePoolsHeader />
      <Tabs
        titleClassName='mb-8'
        initialTabId={initialTabId}
        onTabSelect={(tab) => setData(tab.id)}
        tabs={[
          {
            id: 'all',
            view: <PrizePoolsTable onPrizePoolSelect={onPrizePoolSelect} />,
            title: 'Prize Pools'
          },
          {
            id: 'top',
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
