import { LatestUnlockedDrawId } from '@components/PrizeDistributor/LatestUnlockedDrawId'
import { usePrizeDistributorToken } from '@hooks/v4/PrizeDistributor/usePrizeDistributorToken'
import { useDrawWinners } from '@hooks/v4/useDrawWinners'
import { LinkIcon, TokenIcon } from '@pooltogether/react-components'
import { shorten } from '@pooltogether/utilities'
import { PrizeDistributor } from '@pooltogether/v4-client-js'
import { loopXTimes } from '@utils/loopXTimes'
import classNames from 'classnames'
import { useTranslation, Trans } from 'next-i18next'
import Link from 'next/link'
import { useState } from 'react'

const DEFAULT_ROWS_TO_SHOW = 10
export const PastDrawWinnersTable = (props: {
  prizeDistributor: PrizeDistributor
  drawId: number
  disabled?: boolean
}) => {
  const { prizeDistributor, drawId, disabled } = props
  const { data: winners, isError, isFetched } = useDrawWinners(prizeDistributor, drawId, true)
  const { data: tokenData } = usePrizeDistributorToken(prizeDistributor)
  const [winnersToShow, setWinnersToShow] = useState(DEFAULT_ROWS_TO_SHOW)
  const { t } = useTranslation()
  return (
    <>
      {/* Table Header */}
      <div className='grid grid-cols-2 text-center text-opacity-80 mb-3'>
        <span>{t('winner')}</span>
        <span>{t('prizes')}</span>
      </div>

      {/* Error message */}
      {!!isError && (
        <div className='text-pt-red-light py-8 text-center w-full'>
          <Trans
            i18nkey='anErrorOccurredFetchingWinners'
            components={{ drawId: <LatestUnlockedDrawId prizeDistributor={prizeDistributor} /> }}
          />
        </div>
      )}

      {/* No winners message */}
      {isFetched && winners?.prizes.length === 0 && (
        <div className='opacity-80 w-full text-center py-8'>{t('noWinners')} 😔</div>
      )}

      {/* Table content */}
      <ul className='space-y-2 mb-4'>
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
            className={classNames('grid grid-cols-2 text-center', {
              'filter blur-sm': disabled
            })}
          >
            {!disabled ? (
              <Link href={`/account/${address}`}>
                <a className='hover:text-pt-teal'>
                  {shorten({ hash: address })}
                  <LinkIcon className='w-4 h-4' />
                </a>
              </Link>
            ) : (
              <span>{shorten({ hash: address })}</span>
            )}
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
      </ul>
      {!!winners && winners.prizes.length > winnersToShow && (
        <button
          className='opacity-70 hover:opacity-100 transition-opacity w-full text-center'
          onClick={() => setWinnersToShow(winnersToShow + DEFAULT_ROWS_TO_SHOW)}
        >
          {t('showMore')}
        </button>
      )}
    </>
  )
}
