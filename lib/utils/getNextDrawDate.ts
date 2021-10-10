import { DRAW_DAY_OF_WEEK, DRAW_HOUR_OF_DAY } from 'lib/constants/nextDrawDate'
import { addDays } from './date'

const DAYS_BETWEEN_PRIZES = 1

export const getNextDrawDate = () => {
  let date = new Date()
  let daysUntilDrawDay = getDaysUntilDrawDay(date)

  // If it is today, compare current hour
  if (daysUntilDrawDay === 0 && date.getUTCHours() >= DRAW_HOUR_OF_DAY) {
    daysUntilDrawDay = DAYS_BETWEEN_PRIZES
  }

  date = addDays(date, daysUntilDrawDay)
  date.setUTCHours(DRAW_HOUR_OF_DAY, 0, 0, 0)

  return date
}

const getDaysUntilDrawDay = (date: Date) => {
  const dayOfWeek = date.getUTCDay()
  // % can return a negative value, so add 7 and do it again
  // to get the positive distance from the provided day of the week
  return (
    (((DRAW_DAY_OF_WEEK - dayOfWeek) % DAYS_BETWEEN_PRIZES) + DAYS_BETWEEN_PRIZES) %
    DAYS_BETWEEN_PRIZES
  )
}
