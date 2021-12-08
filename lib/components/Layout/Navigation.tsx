import React from 'react'
import Link from 'next/link'
import classnames from 'classnames'
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

export const TopNavigation = (props: { className?: string }) => {
  const { className } = props

  const router = useRouter()

  return (
    <nav
      className={classnames(
        className,
        'hidden sm:flex flex-row justify-center',
        'bg-pt-purple-bright shadow-lg rounded-xl p-1 font-inter',
        'w-max'
      )}
    >
      {NavLinks.map((navLink) => (
        <TopNavTab
          key={navLink.i18nKey}
          isSelected={navLink.href === router.pathname}
          {...navLink}
        />
      ))}
    </nav>
  )
}

export const BottomNavigation = (props: { className?: string }) => {
  const { className } = props

  const router = useRouter()

  return (
    <nav
      className={classnames(
        className,
        'p-1',
        'flex flex-row justify-center font-inter',
        'sm:hidden',
        'bg-pt-purple-bright shadow-lg',
        'fixed bottom-0 inset-x-0'
      )}
      style={{ zIndex: 2 }}
    >
      {NavLinks.map((navLink) => (
        <BottomNavTab
          key={navLink.i18nKey}
          isSelected={navLink.href === router.pathname}
          {...navLink}
        />
      ))}
    </nav>
  )
}

interface NavTabProps extends NavLink {
  isSelected: boolean
}

const TopNavTab = (props: NavTabProps) => {
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
        className={classnames(
          'transition mx-1 first:ml-0 last:mr-0 rounded-lg py-0 px-3 flex flex-row',
          'text-xs hover:text-white active:bg-highlight-9',
          { 'bg-highlight-9 text-white': isSelected },
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

const BottomNavTab = (props: NavTabProps) => {
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
        className={classnames(
          'transition mx-1 first:ml-0 last:mr-0 rounded-lg py-2 px-3 flex flex-row',
          'text-xs hover:text-white active:bg-highlight-9',
          { 'bg-highlight-9 text-white': isSelected },
          { 'hover:opacity-60': !isSelected }
        )}
      >
        <span className={classnames({ 'text-white opacity-70 hover:opacity-100': !isSelected })}>
          {t(i18nKey)}
        </span>
      </a>
    </Link>
  )
}
