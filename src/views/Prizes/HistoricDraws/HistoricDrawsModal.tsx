import { PrizeWLaurels } from '@components/Images/PrizeWithLaurels'
import { PrizeBreakdown } from '@components/PrizeBreakdown'
import { DrawLock } from '@hooks/v4/PrizeDistributor/useDrawLocks'
import { usePrizeDistributorToken } from '@hooks/v4/PrizeDistributor/usePrizeDistributorToken'
import { useDrawWinnersInfo } from '@hooks/v4/useDrawWinnersInfo'
import { BottomSheet, ExternalLink, LinkTheme, Tabs } from '@pooltogether/react-components'
import { getNetworkNiceNameByChainId } from '@pooltogether/utilities'
import { Draw, PrizeDistribution, PrizeDistributor } from '@pooltogether/v4-client-js'
import { getTimestampStringWithTime } from '@utils/getTimestampString'
import classNames from 'classnames'
import { Trans, useTranslation } from 'next-i18next'
import { PastDrawWinnersTable } from '../PastDrawWinnersTable'

/**
 * NOTE: This shows the winners of the latest draw. It does not account for the timelock.
 * @param props
 * @returns
 */
export const HistoricDrawsModal = (props: {
  drawId: number
  isOpen: boolean
  closeModal: () => void
  prizeDistributor: PrizeDistributor
  drawData: {
    draw: Draw
    prizeDistribution?: PrizeDistribution
  }
  drawLock?: DrawLock
}) => {
  const { isOpen, drawId, closeModal, prizeDistributor, drawData, drawLock } = props
  const { t } = useTranslation()
  const { data: winnersInfo } = useDrawWinnersInfo(prizeDistributor, drawId)
  const { data: tokenData } = usePrizeDistributorToken(prizeDistributor)
  const beaconPeriodSeconds = drawData?.draw.beaconPeriodSeconds
  const beaconPeriodStartedAt = drawData?.draw.beaconPeriodStartedAt.toNumber()

  return (
    <BottomSheet
      label={'Past draws modal'}
      isOpen={isOpen}
      closeModal={() => {
        closeModal()
      }}
    >
      {/* Title */}
      <div className='text-2xl font-bold'>
        <Trans i18nKey='drawId' components={{ id: <DrawId drawId={drawId} /> }} />
      </div>
      <div className='mb-4 font-bold'>
        {getTimestampStringWithTime(beaconPeriodSeconds + beaconPeriodStartedAt)}
      </div>
      <div className='mb-8'>
        <Trans
          i18nKey='pastDrawModalDescription'
          components={{
            drawId: <DrawId drawId={drawId} />,
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

      <Tabs
        titleClassName='mb-8'
        tabs={[
          {
            id: 'winners',
            title: t('winners'),
            view: (
              <PastDrawWinnersTable
                prizeDistributor={prizeDistributor}
                drawId={drawId}
                disabled={!!drawLock}
              />
            )
          },
          {
            id: 'prize_distribution',
            title: t('prizeDistribution'),
            view: (
              <div className='flex flex-col space-y-4'>
                <PrizeWLaurels className='mx-auto' />
                <p className='text-accent-1 text-xs mb-4 text-center'>
                  <Trans
                    i18nKey='prizeTierExplainer'
                    components={{
                      a: (
                        <ExternalLink
                          children={undefined}
                          className='inline-block'
                          href='https://docs.pooltogether.com/welcome/faq#prizes-and-winning'
                          theme={LinkTheme.accent}
                        />
                      )
                    }}
                  />
                </p>

                <PrizeBreakdown
                  className='mx-auto w-full'
                  prizeTier={drawData?.prizeDistribution}
                  decimals={tokenData?.token.decimals}
                />
              </div>
            )
          }
        ]}
        initialTabId={'winners'}
      />
    </BottomSheet>
  )
}

// Annoying wrapper for localization
const DrawId = (props: { drawId: number }) => <>{props.drawId}</>
