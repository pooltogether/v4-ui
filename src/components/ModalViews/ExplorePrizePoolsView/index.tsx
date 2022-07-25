import { BrowsePrizePoolsHeader } from '@components/BrowsePrizePools/BrowsePrizePoolsHeader'
import { BrowsePrizePoolsList } from '@components/BrowsePrizePools/BrowsePrizePoolsList'
import { TopPoolsHorizontalList } from '@components/BrowsePrizePools/TopPoolsHorizontalList'
import { useSelectedPrizePoolAddress } from '@hooks/useSelectedPrizePoolAddress'
import { Tabs, ViewProps } from '@pooltogether/react-components'
import classNames from 'classnames'

export const ExplorePrizePoolsView: React.FC<{} & ViewProps> = (props) => {
  const { previous } = props
  const { setSelectedPrizePoolAddress } = useSelectedPrizePoolAddress()

  // Explore button to go there
  // Submit for valid hook-form moves to confirm view with a TxButton
  return (
    <div>
      <BrowsePrizePoolsHeader className='mb-12' />
      <Tabs
        titleClassName='mb-12'
        tabs={[
          {
            id: 'my-wallet',
            view: 'Mine',
            title: 'My wallet'
          },
          {
            id: 'all',
            view: (
              <div className='flex flex-col'>
                <Title className='mb-3'>Top pools</Title>
                <TopPoolsHorizontalList
                  selectPrizePool={(prizePool) => {
                    setSelectedPrizePoolAddress(prizePool.address)
                    previous()
                  }}
                  marginClassName='mb-12 -mx-2 xs:-mx-8 px-2 xs:px-8'
                />
                <BrowsePrizePoolsList
                  selectPrizePool={(prizePool) => {
                    setSelectedPrizePoolAddress(prizePool.address)
                    previous()
                  }}
                />
              </div>
            ),
            title: 'All Pools'
          }
        ]}
        initialTabId={'all'}
      />
    </div>
  )
}

const Title = (props) => (
  <span {...props} className={classNames(props.className, 'font-bold text-lg')} />
)
