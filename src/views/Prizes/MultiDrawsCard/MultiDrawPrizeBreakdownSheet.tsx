import { ModalProps, BottomSheet } from '@pooltogether/react-components'
import { Token } from '@pooltogether/hooks'
import React, { useMemo, useState } from 'react'

import { DrawData } from '../../../interfaces/v4'
import classNames from 'classnames'
import { Trans, useTranslation } from 'react-i18next'
import { PrizeBreakdown } from '@components/PrizeBreakdown'
import { PrizeWLaurels } from '@components/Images/PrizeWithLaurels'

export const MultiDrawPrizeBreakdownSheet = (
  props: { drawDatas: { [drawId: number]: DrawData }; prizeToken: Token } & Omit<
    ModalProps,
    'label' | 'children'
  >
) => {
  const { drawDatas, prizeToken, closeModal } = props
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
      return drawDatas[drawIds[0]].prizeConfig
    } else {
      return drawData.prizeConfig
    }
  }, [selectedDrawId, drawDatas])

  if (Object.keys(drawDatas).length === 0) {
    return null
  }

  return (
    <BottomSheet
      open={props.isOpen}
      onDismiss={props.closeModal}
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
        {t('prizeBreakdown', 'Prize breakdown')}
      </div>

      <p className='text-accent-1 text-xs text-center'>
        <Trans
          i18nKey='prizeTierExplainer'
          components={{
            a: (
              <a
                className='text-highlight-1 hover:opacity-70 transition-opacity'
                href='https://docs.pooltogether.com/faq/prizes-and-winning'
                target='_blank'
                rel='noopener noreferrer'
              />
            )
          }}
        />
      </p>

      <hr className='opacity-10 border-pt-purple dark:border-white w-80' />

      <PrizeBreakdown
        className='w-full mx-auto'
        prizeConfig={prizeDistribution}
        prizeToken={prizeToken}
      />
    </BottomSheet>
  )
}
