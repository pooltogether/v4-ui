import classnames from 'classnames'
import Link from 'next/link'
import { useRouter } from 'next/router'
import React from 'react'
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

// TODO: Add a gradient bg to a wrapping div on small screens so it dulls the content the nav covers
export const Navigation = (props) => {
  const { className } = props

  const router = useRouter()

  return (
    <div
      className={classnames(
        className,
        'bg-nav-container',
        'sm:absolute sm:bottom-auto mx-auto',
        'fixed bottom-0 pb-6 inset-x-0 z-20'
      )}
    >
      <nav
        className={classnames(
          className,
          'mx-auto',
          'max-w-max flex flex-row rounded-xl bg-pt-purple-bright p-1 font-inter shadow-lg'
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
  return (
    <Link href={href}>
      <a
        className={classnames(
          'transition mx-1 first:ml-0 last:mr-0 rounded-lg px-3 flex flex-row',
          'text-xs hover:text-white active:bg-purple',
          { 'bg-purple text-white': isSelected },
          { 'hover:bg-tertiary': !isSelected }
        )}
      >
        <span className={classnames({ 'text-white opacity-70 hover:opacity-100': !isSelected })}>
          {t(i18nKey)}
        </span>
      </a>
    </Link>
  )
}
