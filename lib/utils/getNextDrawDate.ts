import { DRAW_HOUR_OF_DAY } from 'lib/constants/nextDrawDate'
import { addDays, getDaysUntilDrawDay } from './date'

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
