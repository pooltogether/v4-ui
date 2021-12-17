import React from 'react'
import { Tooltip } from '@pooltogether/react-components'

export const VAPRTooltip = ({ t }) => {
  return (
    <span className='border-b border-dashed border-pt-purple'>
      <Tooltip
        id={`tooltip-vapr`}
        tip={t(
          'vAPRDescription',
          'Variable APR means that the Annual Percentage Rate can change over time.'
        )}
      >
        {t('vAPR', 'vAPR')}
      </Tooltip>
    </span>
  )
}
