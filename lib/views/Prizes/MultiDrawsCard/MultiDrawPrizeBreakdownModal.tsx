import {
  Modal,
  ModalProps,
  SquareButton,
  SquareButtonSize,
  SquareButtonTheme
} from '@pooltogether/react-components'
import { Token } from '@pooltogether/hooks'
import React, { useState } from 'react'

import { DrawData } from 'lib/types/v4'
import classNames from 'classnames'
import { useTranslation } from 'react-i18next'
import { PrizeBreakdown } from 'lib/components/PrizeBreakdown'
import { PrizeWLaurels } from 'lib/components/Images/PrizeWithLaurels'

export const MultiDrawPrizeBreakdownModal = (
  props: { drawDatas: { [drawId: number]: DrawData }; token: Token } & Omit<
    ModalProps,
    'label' | 'children'
  >
) => {
  const { drawDatas, token, closeModal } = props
  const { t } = useTranslation()
  const drawIds = Object.keys(drawDatas).map(Number)
  const [selectedDrawId, setSelectedDrawId] = useState(drawIds[0])
  const prizeDistribution = drawDatas[selectedDrawId].prizeDistribution

  return (
    <Modal
      isOpen={props.isOpen}
      closeModal={props.closeModal}
      label='Prize breakdown modal'
      className='flex flex-col'
    >
      <div className='font-semibold font-inter flex items-center justify-center text-xs xs:text-sm sm:text-lg mb-6 space-x-2'>
        <span>{t('prizesFrom', 'Prizes from')}</span>
        <select
          name='drawIds'
          id='drawIds'
          className={classNames(
            'font-inter transition border border-accent-4 hover:border-default rounded-lg',
            'px-3 flex flex-row text-xs xs:text-sm hover:text-inverse bg-tertiary'
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
      <PrizeBreakdown className='`mx-auto' prizeDistribution={prizeDistribution} token={token} />
      <SquareButton
        theme={SquareButtonTheme.tealOutline}
        size={SquareButtonSize.md}
        className='text-center mx-auto w-3/4 mt-8'
        onClick={props.closeModal}
      >
        {t('close', 'Close')}
      </SquareButton>
    </Modal>
  )
}
