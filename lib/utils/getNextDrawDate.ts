import { DRAW_DAY_OF_WEEK, DRAW_HOUR_OF_DAY } from 'lib/constants/nextDrawDate'

export const getNextDrawDate = () => {
  let date = new Date()
  let daysUntilDrawDay = getDaysUntilDrawDay(date)

  // If it is today, compare current hour
  if (daysUntilDrawDay === 0 && date.getUTCHours() >= DRAW_HOUR_OF_DAY) {
    daysUntilDrawDay = 7
  }

  date = addDays(date, daysUntilDrawDay)
  date.setUTCHours(DRAW_HOUR_OF_DAY, 0, 0, 0)

  return date
}

const getDaysUntilDrawDay = (date: Date) => {
  const dayOfWeek = date.getUTCDay()
  return (((DRAW_DAY_OF_WEEK - dayOfWeek) % 7) + 7) % 7
}

const addDays = (date: Date, days: number) => {
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
