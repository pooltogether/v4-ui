import React from 'react'
import { PageHeaderContainer } from '@pooltogether/react-components'
import Link from 'next/link'

export const PageHeader = (props) => (
  <PageHeaderContainer Link={Link} as='/' href='/'></PageHeaderContainer>
)
