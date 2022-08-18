import { BrowsePrizePoolsHeader } from '@components/BrowsePrizePools/BrowsePrizePoolsHeader'
import { BrowsePrizePoolsList } from '@components/BrowsePrizePools/BrowsePrizePoolsList'
import { HorizontalListByTvl } from '@components/BrowsePrizePools/PrizePoolHorizontalList/HorizontalListByTvl'
import { useSelectedPrizePoolAddress } from '@hooks/useSelectedPrizePoolAddress'
import { ViewProps } from '@pooltogether/react-components'
import { PrizePool } from '@pooltogether/v4-client-js'
import classNames from 'classnames'

const horizontalListMarginClassName = 'mb-12 -mx-2 xs:-mx-8 px-2 xs:px-8'

export const ExplorePrizePoolsView: React.FC<
  { onPrizePoolSelect?: (prizePool: PrizePool) => void } & ViewProps
> = (props) => {
  const { onPrizePoolSelect } = props
  const { setSelectedPrizePoolAddress } = useSelectedPrizePoolAddress()

  const onClick = (prizePool: PrizePool) => {
    setSelectedPrizePoolAddress(prizePool)
    onPrizePoolSelect?.(prizePool)
  }

  return (
    <div>
      <BrowsePrizePoolsHeader className='mb-12' />
      <div className='flex flex-col'>
        <Title className='mb-3'>Top pools</Title>
        <HorizontalListByTvl onClick={onClick} marginClassName={horizontalListMarginClassName} />
        <div className='flex justify-between font-bold text-lg mb-2'>
          <span>All prize pools</span>
        </div>
        <BrowsePrizePoolsList onClick={onClick} />
      </div>
      {/* TODO: Add a list of filtered prize pools by token holdings
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
                <HorizontalListByTvl
                  onClick={onClick}
                  marginClassName={horizontalListMarginClassName}
                />
                <div className='flex justify-between font-bold text-lg mb-2'>
                  <span>All prize pools</span>
                </div>
                <BrowsePrizePoolsList
                  onClick={(prizePool) => {
                    setSelectedPrizePoolAddress(prizePool)
                    next()
                  }}
                />
              </div>
            ),
            title: 'All Pools'
          }
        ]}
        initialTabId={'all'}
      /> */}
    </div>
  )
}

const Title = (props) => (
  <span {...props} className={classNames(props.className, 'font-bold text-lg')} />
)
