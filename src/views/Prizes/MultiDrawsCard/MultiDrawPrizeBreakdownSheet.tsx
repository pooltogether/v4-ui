import { PrizeWLaurels } from '@components/Images/PrizeWithLaurels'
import { PrizeBreakdown } from '@components/PrizeBreakdown'
import { UpcomingPerDrawPrizeValue } from '@components/PrizePoolNetwork/UpcomingPerDrawPrizeValue'
import { ShowMoreTextButton } from '@components/ShowMoreTextButton'
import { Token } from '@pooltogether/hooks'
import { ModalProps, BottomSheet, ExternalLink, LinkTheme } from '@pooltogether/react-components'
import { PerDrawPrizeValue } from '@views/Deposit/PrizePoolNetworkCarousel/PerDrawPrizeValue'
import classNames from 'classnames'
import { Trans, useTranslation } from 'next-i18next'
import React, { useMemo, useState } from 'react'
import { DrawData } from '../../../interfaces/v4'

export const MultiDrawPrizeBreakdownSheet = (
  props: { drawDatas: { [drawId: number]: DrawData }; ticket: Token } & Omit<
    ModalProps,
    'label' | 'children'
  >
) => {
  const { drawDatas, ticket, closeModal } = props
  const { t } = useTranslation()
  const drawIds = Object.keys(drawDatas).map(Number)
  const [selectedDrawId, setSelectedDrawId] = useState(drawIds[0])
  const prizeDistribution = useMemo(() => {
    if (Object.keys(drawDatas).length === 0) {
      return null
    }
    const drawData = drawDatas[selectedDrawId]
    if (!drawData) {
      setSelectedDrawId(drawIds[0])
      return drawDatas[drawIds[0]].prizeDistribution
    } else {
      return drawData.prizeDistribution
    }
  }, [selectedDrawId, drawDatas])

  if (Object.keys(drawDatas).length === 0) {
    return null
  }

  return (
    <BottomSheet
      isOpen={props.isOpen}
      closeModal={props.closeModal}
      label='Prize breakdown modal'
      className='flex flex-col'
    >
      <div className='font-semibold uppercase text-pt-purple-dark text-opacity-60 dark:text-pt-purple-lighter flex items-center justify-center text-xs mb-6 space-x-2'>
        <span>{t('prizesFrom', 'Prizes from')}</span>
        <select
          name='drawIds'
          id='drawIds'
          className={classNames(
            'font-semibold transition border-2 border-accent-4 hover:border-default rounded-lg',
            'px-3 flex flex-row text-xs xs:text-sm hover:text-inverse bg-primary'
          )}
          onChange={(event) => setSelectedDrawId(Number(event.target.value))}
        >
          {drawIds.map((drawId) => (
            <option key={drawId} value={drawId}>
              {t('drawNumber', { number: drawId })}
            </option>
          ))}
        </select>
      </div>

      <PrizeWLaurels className='mx-auto' />
      <div className='font-semibold text-sm capitalize text-inverse my-3 text-center'>
        {t('prizeDistribution', 'Prize distribution')}
      </div>

      <p className='text-xs inline-block mb-4 text-center'>
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

      <PrizeBreakdown className='w-full mx-auto' prizeTier={prizeDistribution} ticket={ticket} />
    </BottomSheet>
  )
}
