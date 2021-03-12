import { format } from 'date-fns'
import { isUndefined } from 'lodash'

export const poolFormat = (date, currentLang = 'en', formatStr = 'PP', noAbbrev) => {
  let locale

  if (currentLang === 'zh') {
    locale = require('date-fns/locale/zh-CN')
  } else if (currentLang === 'es') {
    locale = require('date-fns/locale/es')
  } else if (currentLang === 'de') {
    locale = require('date-fns/locale/de')
  } else if (currentLang === 'fr') {
    locale = require('date-fns/locale/fr')
  } else if (currentLang === 'it') {
    locale = require('date-fns/locale/it')
  } else if (currentLang === 'pt') {
    locale = require('date-fns/locale/pt')
  } else if (currentLang === 'tr') {
    locale = require('date-fns/locale/tr')
  } else if (currentLang === 'ko') {
    locale = require('date-fns/locale/ko')
  } else {
    locale = require('date-fns/locale/en-GB')
  }

  // our Spanish community rep asked for days to be before month names
  if (currentLang === 'es') {
    formatStr = 'do MMMM yyyy'
  }

  // by providing a default string of 'PP' or any of its variants for `formatStr`
  // it will format dates in whichever way is appropriate to the locale
  const formattedDate = format(date * 1000, formatStr, {
    locale: locale.default
  })

  let abbrev = ''
  if (isUndefined(noAbbrev)) {
    abbrev = new Date().toLocaleTimeString('en-us', { timeZoneName: 'short' }).split(' ')[2]
  }

  return `${formattedDate} ${abbrev}`
}
