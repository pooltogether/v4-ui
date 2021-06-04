import {
  BottomAccountIcon,
  BottomNavContainer,
  BottomNavLink,
  BottomPoolsIcon,
  BottomVoteIcon
} from '@pooltogether/react-components'
import Link from 'next/link'
import { useRouter } from 'next/router'
import React from 'react'
import { useTranslation } from 'react-i18next'

export const BottomNav = (props) => {
  return (
    <BottomNavContainer>
      <BottomNavLink
        href='https://app.pooltogether.com'
        as='https://app.pooltogether.com'
        label={'Pools'}
        Link={Link}
        useRouter={useRouter}
      >
        <BottomPoolsIcon />
      </BottomNavLink>
      <BottomNavLink
        href='https://app.pooltogether.com/account'
        as='https://app.pooltogether.com/account'
        label={'Account'}
        Link={Link}
        useRouter={useRouter}
      >
        <BottomAccountIcon />
      </BottomNavLink>
      <BottomNavLink href='/' as='/' label={'Vote'} Link={Link} useRouter={useRouter} match='/'>
        <BottomVoteIcon />
      </BottomNavLink>
    </BottomNavContainer>
  )
}
