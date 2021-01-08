import React, { useEffect, useState } from 'react'
import Cookies from 'js-cookie'
import classnames from 'classnames'
import FeatherIcon from 'feather-icons-react'
import VisuallyHidden from '@reach/visually-hidden'
import { motion } from 'framer-motion'

import { useTranslation } from 'lib/../i18n'
import { COOKIE_OPTIONS, SHOW_MANAGE_LINKS } from 'lib/constants'
import { CheckboxInputGroup } from 'lib/components/CheckboxInputGroup'
import { ThemeSwitcher } from 'lib/components/ThemeSwitcher'

export function Settings(props) {
  const { t } = useTranslation()
  const [isOpen, setIsOpen] = useState(false)

  const [showManageLinks, setShowManageLinks] = useState(false)
  useEffect(() => {
    const cookieShowAward = Cookies.get(SHOW_MANAGE_LINKS)
    setShowManageLinks(cookieShowAward)
  }, [])

  const handleShowManageLinksClick = (e) => {
    e.preventDefault()

    if (showManageLinks) {
      Cookies.remove(SHOW_MANAGE_LINKS, COOKIE_OPTIONS)
    } else {
      Cookies.set(SHOW_MANAGE_LINKS, 1, COOKIE_OPTIONS)
    }

    setShowManageLinks(!showManageLinks)
  }

  const toggleOpen = (e) => {
    e.preventDefault()

    setIsOpen(!isOpen)
  }
  
  return <>
    <button
      onClick={toggleOpen}
      className={classnames(
        'w-5 h-5 sm:w-6 sm:h-6 ml-2 my-2 hover:text-inverse',
        {
          'text-highlight-2': !isOpen,
          'text-highlight-1': isOpen,
        }
      )}
    >
      <FeatherIcon
        icon='settings'
        className='w-full h-full'
        strokeWidth='0.09rem'
      />
    </button>

    <motion.div
      key='settings-overlay'
      onClick={toggleOpen}
      className={classnames(
        'fixed t-0 l-0 r-0 b-0 w-full h-full z-30 bg-overlay bg-blur',
        {
          'pointer-events-none': !isOpen
        }
      )}
      style={{
        top: 108
      }}
      animate={isOpen ? 'enter' : 'exit'}
      initial='initial'
      variants={{
        exit: {
          opacity: 0,
          transition: {
            duration: 0.1,
          }
        },
        enter: {
          opacity: 1,
          transition: {
            duration: 0.1,
          }
        },
        initial: {
          opacity: 0,
        }
      }}
    />

    <motion.div
      className='bg-highlight-3 h-full fixed t-0 b-0 z-40 px-8 pr-16 py-8 shadow-md'
      style={{
        height: '100vh',
        right: -30,
        top: '108px',
        width: '320px'
      }}
      animate={isOpen ? 'enter' : 'exit'}
      initial='initial'
      variants={{
        exit: {
          x: '320px',
          opacity: 0,
          transition: {
            staggerChildren: 0.1
          }
        },
        enter: {
          x: 0,
          opacity: 1,
          transition: {
            duration: 0.1,
            staggerChildren: 0.1
          }
        },
        initial: {
          x: 0,
          opacity: 0,
        }
      }}
    >
      <button
        onClick={toggleOpen}
        className='absolute close-button text-highlight-2 hover:text-green trans outline-none focus:outline-none active:outline-none'
        style={{
          right: 50,
          top: 34
        }}
      >
        <VisuallyHidden>
          Close
        </VisuallyHidden>
        <span
          aria-hidden
        >
          <FeatherIcon
            icon='x-circle'
            className='w-6 h-6'
          />
        </span>
      </button>

      <h6
        className='text-white mt-4 mb-16 capitalize'
      >
        {t('settings')}
      </h6>

      <div className='my-12'>
        <label
          className='uppercase text-caption font-mono mb-4'
        >
          {t('theme')}:
        </label>
        <ThemeSwitcher />
      </div>


      <div className='my-12'>
        <label
          className='uppercase text-caption font-mono mb-2'
        >
          {t('manage')}:
        </label>
        <div
          className='flex flex-col sm:flex-wrap sm:flex-row items-center justify-start text-center'
        >
          <CheckboxInputGroup
            large
            id='settings-show-award'
            name='settings-show-award'
            label={t('showPoolManagementPages')}
            title={t('managePools')}
            hint={<>
              <div className='my-2 text-xs sm:text-sm'>
                {t('showPoolManagementDescription')}
              </div>
            </>}
            checked={showManageLinks}
            handleClick={handleShowManageLinksClick}
          />
        </div>
      </div>
    </motion.div>
  </>
}