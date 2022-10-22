import { LatestDrawId } from '@components/PrizeDistributor/LatestDrawId'
import { usePrizeDistributorToken } from '@hooks/v4/PrizeDistributor/usePrizeDistributorToken'
import { useLatestDrawWinners } from '@hooks/v4/useDrawWinners'
import { useLatestDrawWinnersInfo } from '@hooks/v4/useDrawWinnersInfo'
import { LinkIcon, Modal, TokenIcon } from '@pooltogether/react-components'
import { getNetworkNiceNameByChainId, shorten } from '@pooltogether/utilities'
import { PrizeDistributor } from '@pooltogether/v4-client-js'
import { loopXTimes } from '@utils/loopXTimes'
import classNames from 'classnames'
import { Trans, useTranslation } from 'next-i18next'
import Link from 'next/link'
import { useState } from 'react'

const DEFAULT_ROWS_TO_SHOW = 10

/**
 * NOTE: This shows the winners of the latest draw. It does not account for the timelock.
 * @param props
 * @returns
 */
export const PastDrawsModal = (props: {
  isOpen: boolean
  closeModal: () => void
  prizeDistributor: PrizeDistributor
}) => {
  const { isOpen, closeModal, prizeDistributor } = props
  const { t } = useTranslation()
  const { data: winners, isError, isFetched } = useLatestDrawWinners(prizeDistributor, true)
  const { data: winnersInfo } = useLatestDrawWinnersInfo(prizeDistributor)
  const { data: tokenData } = usePrizeDistributorToken(prizeDistributor)
  const [winnersToShow, setWinnersToShow] = useState(DEFAULT_ROWS_TO_SHOW)

  return (
    <Modal
      label={'Past draws modal'}
      isOpen={isOpen}
      closeModal={() => {
        setWinnersToShow(DEFAULT_ROWS_TO_SHOW)
        closeModal()
      }}
    >
      {/* Title */}
      <div className='text-2xl font-bold flex space-x-2 mb-4'>
        <Trans
          i18nKey='drawId'
          components={{ id: <LatestDrawId prizeDistributor={prizeDistributor} /> }}
        />
      </div>
      <div className='mb-8'>
        <Trans
          i18nKey='pastDrawModalDescription'
          components={{
            drawId: <LatestDrawId prizeDistributor={prizeDistributor} />,
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
            valueOfPrize: winnersInfo?.amount.amountPretty,
            ticker: tokenData?.token.symbol
          }}
        />
      </div>

      {/* Table Header */}
      <div className='grid grid-cols-2 text-center text-opacity-80 mb-3'>
        <span>{t('winner')}</span>
        <span>{t('prizes')}</span>
      </div>

      {/* Error message */}
      {!!isError && (
        <div className='text-pt-red-light py-8 text-center w-full'>
          An error occurred fetching winners for draw #
          <LatestDrawId prizeDistributor={prizeDistributor} />
        </div>
      )}

      {/* No winners message */}
      {isFetched && winners?.prizes.length === 0 && (
        <div className='opacity-80 w-full text-center py-8'>{t('noWinners')} 😔</div>
      )}

      {/* Table content */}
      <ul className='space-y-2'>
        {!isFetched && (
          <>
            {loopXTimes(5, (i) => (
              <li
                key={`loading-list-${i}`}
                className='rounded-lg bg-white bg-opacity-20 dark:bg-actually-black dark:bg-opacity-10 animate-pulse w-full h-10'
              />
            ))}
          </>
        )}
        {winners?.prizes.slice(0, winnersToShow).map(({ address, amount, pick, tier }) => (
          <li
            key={`${prizeDistributor.id()}-${address}-${pick}`}
            className='grid grid-cols-2 text-center'
          >
            <Link href={`/account/${address}`}>
              <a className='hover:text-pt-teal'>
                {shorten({ hash: address })}
                <LinkIcon className='w-4 h-4' />
              </a>
            </Link>
            <div className='flex space-x-1 items-center mx-auto'>
              <TokenIcon
                chainId={prizeDistributor.chainId}
                address={tokenData?.token.address}
                sizeClassName='w-4 h-4'
              />
              <b className={classNames({ 'text-flashy': tier === 0 })}>{amount.amountPretty}</b>
            </div>
          </li>
        ))}
        {!!winners && winners.prizes.length > winnersToShow && (
          <button
            className='opacity-70 hover:opacity-100 transition-opacity w-full text-center'
            onClick={() => setWinnersToShow(winnersToShow + DEFAULT_ROWS_TO_SHOW)}
          >
            {t('showMore')}
          </button>
        )}
      </ul>
    </Modal>
  )
}
