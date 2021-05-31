import React from 'react'
import classnames from 'classnames'
import FeatherIcon from 'feather-icons-react'

import { useTranslation } from 'react-i18next'
import { useTimeCountdown } from 'lib/hooks/useTimeCountdown'
import { SECONDS_PER_DAY, SECONDS_PER_HOUR } from 'lib/constants'
import { getSecondsSinceEpoch } from 'lib/utils/getCurrentSecondsSinceEpoch'

/**
 * endTime - An time in seconds since the epoch to count down to
 * initialSecondsLeft - A number of seconds to count down
 */
export const TimeCountDown = (props) => {
  const { endTime, secondsLeft: initialSecondsLeft, className } = props
  const { t } = useTranslation()

  const { days, hours, minutes, secondsLeft } = useTimeCountdown(
    endTime ? endTime - getSecondsSinceEpoch() : initialSecondsLeft || 0,
    null,
    60000
  )

  const textColor = determineColor(secondsLeft)

  return (
    <div className={classnames('flex items-center text-accent-1 sm:mt-1', className)}>
      <FeatherIcon
        className={classnames(`h-4 w-4 stroke-current stroke-2 my-auto mx-2`, textColor)}
        icon='clock'
      />
      <span className={classnames(textColor)}>
        {!days ? null : `${days}d, `}
        {!hours && !days ? null : `${hours}h, `}
        {`${minutes}m`}
      </span>
    </div>
  )
}

const determineColor = (secondsLeft) => {
  if (secondsLeft <= SECONDS_PER_HOUR) {
    return 'text-red'
  } else if (secondsLeft <= SECONDS_PER_DAY) {
    return 'text-orange'
  }

  return ''
}
