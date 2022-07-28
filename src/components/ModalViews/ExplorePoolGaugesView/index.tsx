import { BrowsePoolGaugesHeader } from '@components/BrowsePoolGauges/BrowsePoolGaugesHeader'
import { BrowsePoolGaugesList } from '@components/BrowsePoolGauges/BrowsePoolGaugesList'
import { TopPoolGaugesHorizontalList } from '@components/BrowsePoolGauges/TopPoolGaugesHorizontalList'
import { useSelectedPrizePoolAddress } from '@hooks/useSelectedPrizePoolAddress'
import { Tabs, ViewProps } from '@pooltogether/react-components'
import classNames from 'classnames'

export const ExplorePoolGaugesView: React.FC<{} & ViewProps> = (props) => {
  const { next } = props
  const { setSelectedPrizePoolAddress } = useSelectedPrizePoolAddress()

  // Explore button to go there
  // Submit for valid hook-form moves to confirm view with a TxButton
  return (
    <div>
      <BrowsePoolGaugesHeader className='mb-12' />
      <div className='flex flex-col'>
        <Title className='mb-3'>Top Gauges</Title>
        <TopPoolGaugesHorizontalList
          selectPrizePool={(prizePool) => {
            setSelectedPrizePoolAddress(prizePool.address)
            next()
          }}
          marginClassName='mb-12 -mx-2 xs:-mx-8 px-2 xs:px-8'
        />
        <BrowsePoolGaugesList
          selectPrizePool={(prizePool) => {
            setSelectedPrizePoolAddress(prizePool.address)
            next()
          }}
        />
      </div>
    </div>
  )
}

const Title = (props) => (
  <span {...props} className={classNames(props.className, 'font-bold text-lg')} />
)
