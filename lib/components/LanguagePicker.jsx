import React, { useEffect, useState } from 'react'

import { i18n } from 'lib/../i18n'
import { DropdownList } from 'lib/components/DropdownList'

{/*
  de: Deutsch (German)
  en: English
  es: Español (Spanish)
  fr: Français (French)
  hr: Hrvatski (Croatian)
  it: Italiana (Italian)
  ja: 日本 (Japanese)
  ko: 한국어 (Korean)
  tr: Türk (Turkish)
  zh: 普通话 (Mandarin)
*/}

export function LanguagePicker(props) {
  const [langs, setLangs] = useState(
    {
      en: {
        'name': 'English',
        'nativeName': 'English'
      },
    }
  )

  const [currentLang, setCurrentLang] = useState('en')

  const onValueSet = (newLang) => {
    setCurrentLang(newLang)
    i18n.changeLanguage(newLang)
  }

  // set lang to whatever i18n thinks it should be (based
  // on lang detection or stored cookies)
  useEffect(() => {
    if (i18n.language) {
      setCurrentLang(i18n.language)
    }
  }, [])
  
  useEffect(() => {
    const runGetLangs = async () => {
      await i18n.services.backendConnector.backend.getLanguages((err, result) => {
        if (err) {
          console.error(`There was an error getting the languages from locize: `, err)
        }

        const activeLangsArray = Object.keys(result).reduce(function (array, lang) {
          if (i18n.options.allLanguages.includes(lang)) {
            array.push(lang)
          }
          return array
        }, [])

        let items = {}
        activeLangsArray.forEach(valueItem => {
          items[valueItem] = result[valueItem]
        })
        
        setLangs(items)
      })
    }
    runGetLangs()
  }, [])


  const formatValue = (key) => {
    const lang = langs[key]

    return <>
      {key.toUpperCase()} - <span className='capitalize'>
        {lang.nativeName.split(',')[0]}
      </span> ({lang.name.split(';')[0]})
    </>
  }

  return <>
    <DropdownList
      id='language-picker-dropdown'
      className='ml-8 xs:ml-6 sm:ml-6 mr-2 sm:mr-4 my-2 text-xxs sm:text-base text-lg'
      label={currentLang?.toUpperCase()}
      formatValue={formatValue}
      onValueSet={onValueSet}
      current={currentLang}
      values={langs}
    />

  </>
}