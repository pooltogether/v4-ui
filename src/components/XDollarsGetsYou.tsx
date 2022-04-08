import { useSelectedPrizePoolTicketDecimals } from '@hooks/v4/PrizePool/useSelectedPrizePoolTicketDecimals'
import { useEstimatedOddsForAmount } from '@hooks/v4/Odds/useEstimatedOddsForAmount'
import { getAmountFromString } from '@utils/getAmountFromString'
import React from 'react'
import { Trans } from 'react-i18next'

interface XDollarsGetsYouProps
  extends React.DetailedHTMLProps<React.HTMLAttributes<HTMLSpanElement>, HTMLSpanElement> {
  x: string
}

export const XDollarsGetsYou = (props: XDollarsGetsYouProps) => {
  const { x, ...spanProps } = props
  const { data: decimals, isFetched } = useSelectedPrizePoolTicketDecimals()
  const { data: odds } = useEstimatedOddsForAmount(
    isFetched ? getAmountFromString(x, decimals) : undefined
  )

  return (
    <span {...spanProps}>
      <Trans
        i18nKey='xDollarsGetsYouOdds'
        values={{ dollars: x, odds: odds?.oneOverOdds?.toFixed(2) || '--' }}
        components={{ style1: <b className='' />, style2: <b /> }}
      />
    </span>
  )
}

XDollarsGetsYou.defaultProps = {
  x: '10'
}
