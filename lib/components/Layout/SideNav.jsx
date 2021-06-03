import React from 'react'
import {
  SideNavContainer,
  SideNavLink,
  SideAccountIcon,
  SideVoteIcon,
  SidePoolsIcon
} from '@pooltogether/react-components'
import { useTranslation } from 'react-i18next'

export const SideNav = (props) => {
  const { t } = useTranslation()

  return (
    <SideNavContainer>
      <SideNavLink
        href='https://app.pooltogether.com'
        as='https://app.pooltogether.com'
        label={'Pools'}
      >
        <SidePoolsIcon />
      </SideNavLink>
      <SideNavLink
        href='https://app.pooltogether.com/account'
        as='https://app.pooltogether.com/account'
        label={t('account')}
      >
        <SideAccountIcon />
      </SideNavLink>
      <SideNavLink href='/' as='/' shallow label={t('vote')}>
        <SideVoteIcon />
      </SideNavLink>
    </SideNavContainer>
  )
}
