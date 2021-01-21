import { subtractDates } from 'lib/utils/subtractDates'

export const formatTwoDatesDiff = (dateA, dateB) => {
  const diff = subtractDates(dateB, dateA)

  return `${diff.days}d ${diff.hours}h ${diff.minutes}m ${diff.seconds}s`
}
