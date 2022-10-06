import { LatestDrawId } from '@components/PrizeDistributor/LatestDrawId'
import { CardTitle } from '@components/Text/CardTitle'
import { usePrizeDistributors } from '@hooks/v4/PrizeDistributor/usePrizeDistributors'
import { NetworkIcon } from '@pooltogether/react-components'
import { getNetworkNiceNameByChainId } from '@pooltogether/utilities'
import { PrizeDistributor } from '@pooltogether/v4-client-js'
import { AccountListItem } from '@views/Account/AccountList/AccountListItem'
import { useState } from 'react'
import { PastDrawsModal } from './PastDrawsModal'

export const PastDraws = () => {
  const prizeDistributors = usePrizeDistributors()
  const [prizeDistributor, setPrizeDistributor] = useState<PrizeDistributor>(prizeDistributors[0])
  const [isOpen, setIsOpen] = useState(false)

  return (
    <div>
      <CardTitle title={'Last Draw'} className='mb-2' />
      <ul className='bg-white bg-opacity-20 dark:bg-actually-black dark:bg-opacity-10 rounded-xl w-full p-4 flex flex-col space-y-1 mb-4'>
        {prizeDistributors?.map((prizeDistributor) => (
          <AccountListItem
            key={`pd-past-draw-winners-${prizeDistributor.id()}`}
            left={
              <div className='flex items-center space-x-2 '>
                <NetworkIcon chainId={prizeDistributor.chainId} />
                <span>{getNetworkNiceNameByChainId(prizeDistributor.chainId)}</span>
              </div>
            }
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
