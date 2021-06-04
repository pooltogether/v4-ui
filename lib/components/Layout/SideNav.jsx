import React from 'react'
import {
  SideNavContainer,
  SideNavLink,
  SideAccountIcon,
  SideVoteIcon,
  SidePoolsIcon
} from '@pooltogether/react-components'
import { useTranslation } from 'react-i18next'
import Link from 'next/link'
import { useRouter } from 'next/router'

export const SideNav = (props) => {
  const { t } = useTranslation()

  return (
    <SideNavContainer>
      <SideNavLink
        href='https://app.pooltogether.com'
        as='https://app.pooltogether.com'
        label={'Pools'}
        Link={Link}
        useRouter={useRouter}
      >
        <SidePoolsIcon />
      </SideNavLink>
      <SideNavLink
        href='https://app.pooltogether.com/account'
        as='https://app.pooltogether.com/account'
        label={t('account')}
        Link={Link}
        useRouter={useRouter}
      >
        <SideAccountIcon />
      </SideNavLink>
      <SideNavLink
        href='/'
        as='/'
        shallow
        label={t('vote')}
        Link={Link}
        useRouter={useRouter}
        match='/'
      >
        <SideVoteIcon />
      </SideNavLink>
    </SideNavContainer>
  )
}
