import { getMaxPrecision, numberWithCommas } from '@pooltogether/utilities'
import { InfoListItem } from 'lib/components/InfoList'
import React from 'react'
import { useTranslation } from 'react-i18next'
import { Tooltip } from '@pooltogether/react-components'

const TokensToReceiveItem = (props) => {
  const { token, amount } = props
  const { t } = useTranslation()

  const amountPretty = numberWithCommas(amount)
  const fullFinalBalancePretty = numberWithCommas(amount, {
    precision: getMaxPrecision(amount)
  })

  return (
    <InfoListItem
      label={t('tickerToReceive', { ticker: token.symbol })}
      value={
        <Tooltip
          id={`${token.symbol}-to-receive`}
          tip={`${fullFinalBalancePretty} ${token.symbol}`}
        >
          <div className='flex flex-wrap justify-end'>
            <span>{amountPretty}</span>
            <span className='ml-1'>{token.symbol}</span>
          </div>
        </Tooltip>
      }
    />
  )
}
