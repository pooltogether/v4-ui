import { LatestUnlockedDrawId } from '@components/PrizeDistributor/LatestUnlockedDrawId'
import { useLatestUnlockedDrawId } from '@hooks/v4/PrizeDistributor/useLatestUnlockedDrawId'
import { usePrizeDistributorToken } from '@hooks/v4/PrizeDistributor/usePrizeDistributorToken'
import { useLatestUnlockedDrawWinners } from '@hooks/v4/useDrawWinners'
import { useLatestUnlockedDrawWinnersInfo } from '@hooks/v4/useDrawWinnersInfo'
import { BottomSheet, LinkIcon, TokenIcon } from '@pooltogether/react-components'
import { getNetworkNiceNameByChainId, shorten } from '@pooltogether/utilities'
import { PrizeDistributor } from '@pooltogether/v4-client-js'
import { loopXTimes } from '@utils/loopXTimes'
import classNames from 'classnames'
import { Trans, useTranslation } from 'next-i18next'
import Link from 'next/link'
import { useState } from 'react'
import { PastDrawWinnersTable } from '../PastDrawWinnersTable'

/**
 * NOTE: This shows the winners of the latest draw. It does not account for the timelock.
 * @param props
 * @returns
 */
export const LastDrawWinnersModal = (props: {
  isOpen: boolean
  closeModal: () => void
  prizeDistributor: PrizeDistributor
}) => {
  const { isOpen, closeModal, prizeDistributor } = props
  const { t } = useTranslation()
  const { drawId } = useLatestUnlockedDrawId(prizeDistributor)
  const { data: winnersInfo } = useLatestUnlockedDrawWinnersInfo(prizeDistributor)
  const { data: tokenData } = usePrizeDistributorToken(prizeDistributor)

  return (
    <BottomSheet
      label={'Past draws modal'}
      isOpen={isOpen}
      closeModal={() => {
        closeModal()
      }}
    >
      {/* Title */}
      <div className='text-2xl font-bold flex space-x-2 mb-4'>
        <Trans
          i18nKey='drawId'
          components={{ id: <LatestUnlockedDrawId prizeDistributor={prizeDistributor} /> }}
        />
      </div>
      <div className='mb-8'>
        <Trans
          i18nKey='pastDrawModalDescription'
          components={{
            drawId: <LatestUnlockedDrawId prizeDistributor={prizeDistributor} />,
            b: <b />,
            flashy: (
              <b
                className={classNames({
                  'text-flashy': !!winnersInfo && !winnersInfo.amount.amountUnformatted.isZero()
                })}
              />
            )
          }}
          values={{
            network: getNetworkNiceNameByChainId(prizeDistributor.chainId),
            numberOfPrizes: winnersInfo?.prizesWon,
            valueOfPrizes: winnersInfo?.amount.amountPretty,
            ticker: tokenData?.token.symbol
          }}
        />
      </div>

      <PastDrawWinnersTable prizeDistributor={prizeDistributor} drawId={drawId} />
    </BottomSheet>
  )
}
