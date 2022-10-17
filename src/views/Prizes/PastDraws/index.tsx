import { ListItem } from '@components/List/ListItem'
import { LatestDrawId } from '@components/PrizeDistributor/LatestDrawId'
import { PrizeDistributorLabel } from '@components/PrizeDistributor/PrizeDistributorLabel'
import { CardTitle } from '@components/Text/CardTitle'
import { usePrizeDistributors } from '@hooks/v4/PrizeDistributor/usePrizeDistributors'
import { PrizeDistributor } from '@pooltogether/v4-client-js'
import { useState } from 'react'
import { PastDrawsModal } from './PastDrawsModal'

export const PastDraws = () => {
  const prizeDistributors = usePrizeDistributors()
  const [prizeDistributor, setPrizeDistributor] = useState<PrizeDistributor>(prizeDistributors[0])
  const [isOpen, setIsOpen] = useState(false)

  return (
    <div>
      <CardTitle title={'Winners'} className='mb-2' />
      <ul className='bg-white bg-opacity-20 dark:bg-actually-black dark:bg-opacity-10 rounded-xl w-full p-4 flex flex-col space-y-1'>
        {prizeDistributors?.map((prizeDistributor) => (
          <ListItem
            key={`pd-past-draw-winners-${prizeDistributor.id()}`}
            left={<PrizeDistributorLabel prizeDistributor={prizeDistributor} />}
            onClick={() => {
              setIsOpen(true)
              setPrizeDistributor(prizeDistributor)
            }}
            right={
              <b>
                Draw #<LatestDrawId prizeDistributor={prizeDistributor} />
              </b>
            }
          />
        ))}
      </ul>
      <PastDrawsModal
        isOpen={isOpen}
        closeModal={() => setIsOpen(false)}
        prizeDistributor={prizeDistributor}
      />
    </div>
  )
}
