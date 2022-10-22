import { ListItem } from '@components/List/ListItem'
import { LatestDrawId } from '@components/PrizeDistributor/LatestDrawId'
import { PrizeDistributorLabel } from '@components/PrizeDistributor/PrizeDistributorLabel'
import { NumberOfPrizesWonLastDraw } from '@components/PrizePoolNetwork/NumberOfPrizesWonLastDraw'
import { ValueOfPrizesWonLastDraw } from '@components/PrizePoolNetwork/ValueOfPrizesWonLastDraw'
import { CardTitle } from '@components/Text/CardTitle'
import { usePrizeDistributors } from '@hooks/v4/PrizeDistributor/usePrizeDistributors'
import { PrizeDistributor } from '@pooltogether/v4-client-js'
import { Trans } from 'next-i18next'
import { useState } from 'react'
import { PastDrawsModal } from './PastDrawsModal'

export const PastDraws = () => {
  const prizeDistributors = usePrizeDistributors()
  const [prizeDistributor, setPrizeDistributor] = useState<PrizeDistributor>(prizeDistributors[0])
  const [isOpen, setIsOpen] = useState(false)

  return (
    <>
      <div className='bg-white bg-opacity-20 dark:bg-actually-black dark:bg-opacity-10 rounded-xl w-full p-4'>
        <div className='flex  items-center mb-4'>
          <img
            src='/trophy.svg'
            className='w-5 h-5 xs:w-6 xs:h-6 sm:w-8 sm:h-8 lg:w-10 lg:h-10 mr-2'
          />
          <div className='text-lg xs:text-xl sm:text-2xl lg:text-3xl'>
            <Trans
              i18nKey='amountWonAcrossPrizes'
              components={{
                b: <b />,
                valueOfPrizesWon: <ValueOfPrizesWonLastDraw />,
                numberOfPrizesWon: <NumberOfPrizesWonLastDraw />
              }}
            />
          </div>
        </div>
        <ul className='flex flex-col space-y-1'>
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
                  <Trans
                    i18nKey='drawId'
                    components={{ id: <LatestDrawId prizeDistributor={prizeDistributor} /> }}
                  />
                </b>
              }
            />
          ))}
        </ul>
      </div>
      <PastDrawsModal
        isOpen={isOpen}
        closeModal={() => setIsOpen(false)}
        prizeDistributor={prizeDistributor}
      />
    </>
  )
}
