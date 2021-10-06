import { DRAW_DAY_OF_WEEK } from 'lib/constants/nextDrawDate'

export const getDaysUntilDrawDay = (date: Date) => {
  const dayOfWeek = date.getUTCDay()
  // % can return a negative value, so add 7 and do it again
  // to get the positive distance from the provided day of the week
  return (((DRAW_DAY_OF_WEEK - dayOfWeek) % 7) + 7) % 7
}

export const addDays = (date: Date, days: number) => {
  var result = new Date(date)
  result.setDate(result.getDate() + days)
  return result
}

export const getPrettyDate = (date: Date) => {
  return date.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    //
    hour: 'numeric',
    minute: 'numeric'
  })
}
