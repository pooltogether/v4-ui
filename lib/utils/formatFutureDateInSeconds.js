import addSeconds from 'date-fns/addSeconds'

import { formatTwoDatesDiff } from 'lib/utils/formatTwoDatesDiff'

export const formatFutureDateInSeconds = (secondsRemaining) => {
  const currentDate = new Date(Date.now())
  const futureDate = addSeconds(currentDate, secondsRemaining)

  return formatTwoDatesDiff(currentDate, futureDate)
}