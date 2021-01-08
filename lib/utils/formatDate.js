import { fromUnixTime } from 'date-fns'
import { isUndefined } from 'lodash'

import { poolFormat } from 'lib/date-fns-factory'

const currentLang = 'en'

export const formatDate = (date, options = {}) => {
  if (!date) { return }

  let formatStr = 'MMM do, yyyy, HH:mm'

  if (options.short) {
    formatStr = 'MMM do, yyyy'

    if (!isUndefined(options.year) && options.year === false) {
      formatStr = 'MMM do'
    }
  }
  
  date = typeof fromUnixTime(date) === 'object' ?
    date :
    fromUnixTime(date)

  return poolFormat(
    date,
    currentLang,
    formatStr,
    options.noAbbrev
  )
}
