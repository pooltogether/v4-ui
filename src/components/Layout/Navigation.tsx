import React from 'react'
import Link from 'next/link'
import classNames from 'classnames'
import { useRouter } from 'next/router'
import { useTranslation } from 'react-i18next'

interface NavLink {
  i18nKey: string
  href: string
}

const NavLinks: NavLink[] = [
  {
    i18nKey: 'deposit',
    href: '/deposit'
  },
  {
    i18nKey: 'prizes',
    href: '/prizes'
  },
  {
    i18nKey: 'account',
    href: '/account'
  }
]

export const Navigation: React.FC<{ className?: string }> = (props) => {
  const { className } = props

  const router = useRouter()

  return (
    <div
      className={classNames(
        className,
        'z-10',
        'flex flex-row justify-center',
        'w-full pointer-events-none',
        'fixed bottom-3 top-auto sm:bottom-auto sm:top-2 inset-x-0'
      )}
    >
      <nav
        className={classNames(
          className,
          'flex flex-row space-x-4 pointer-events-auto py-2 px-5',
          'dark:bg-actually-black bg-opacity-10 bg-white dark:bg-opacity-10 shadow-lg rounded-xl p-1 backdrop-filter backdrop-blur-sm',
          'rounded-full'
        )}
      >
        {NavLinks.map((navLink) => (
          <NavTab
            key={navLink.i18nKey}
            isSelected={navLink.href === router.pathname}
            {...navLink}
          />
        ))}
      </nav>
    </div>
  )
}

interface NavTabProps extends NavLink {
  isSelected: boolean
}

const NavTab = (props: NavTabProps) => {
  const { isSelected, i18nKey, href } = props
  const { t } = useTranslation()
  const router = useRouter()

  return (
    <Link
      href={{
        pathname: href,
        query: router.query
      }}
    >
      <a
        className={classNames(
          'group transition mx-1 first:ml-0 last:mr-0 rounded-lg flex flex-col',
          'text-xs font-bold text-inverse uppercase tracking-tight'
        )}
      >
        <span className={classNames({ 'opacity-70 hover:opacity-100': !isSelected })}>
          {t(i18nKey)}
        </span>
        <div
          className={classNames(
            'h-0.5 rounded-full w-1/3 mx-auto dark:group-hover:bg-white dark:group-hover:bg-opacity-10 group-hover:bg-actually-black group-hover:bg-opacity-10',
            {
              'bg-gradient-magenta': isSelected,
              'bg-transparent': !isSelected
            }
          )}
        />
      </a>
    </Link>
  )
}
