import React, { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'

import { DropdownList } from 'lib/components/DropdownList'

export function LanguagePicker(props) {
  const langs = {
    en: {
      name: 'English',
      nativeName: 'English'
    },
    es: {
      name: 'Spanish',
      nativeName: 'Español'
    },
    de: {
      name: 'German',
      nativeName: 'Deutsch'
    },
    fr: {
      name: 'French',
      nativeName: 'Français'
    },
    it: {
      name: 'Italian',
      nativeName: 'Italiana'
    },
    ko: {
      name: 'Korean',
      nativeName: '한국어 (韓國語)'
    },
    pt: {
      name: 'Portuguese',
      nativeName: 'Português'
    },
    tr: {
      name: 'Turkish',
      nativeName: 'Türkçe'
    },
    zh: {
      name: 'Zhōngwén',
      nativeName: '中文'
    }
  }

  const { i18n: i18next } = useTranslation()

  const [currentLang, setCurrentLang] = useState(i18next.language)

  const onValueSet = (newLang) => {
    setCurrentLang(newLang)
    i18next.changeLanguage(newLang)
  }

  const formatValue = (key) => {
    const lang = langs[key]

    return (
      <>
        {key.toUpperCase()} - <span className='capitalize'>{lang.nativeName.split(',')[0]}</span> (
        {lang.name.split(';')[0]})
      </>
    )
  }

  return (
    <DropdownList
      id='language-picker-dropdown'
      className='ml-8 xs:ml-6 sm:ml-6 mr-2 sm:mr-4 my-2 sm:text-base text-lg'
      label={currentLang?.toUpperCase()}
      formatValue={formatValue}
      onValueSet={onValueSet}
      current={currentLang}
      values={langs}
    />
  )
}
