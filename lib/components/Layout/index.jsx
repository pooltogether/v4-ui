import { DefaultLayout } from '@pooltogether/react-components'
import { BottomNav } from 'lib/components/Layout/BottomNav'
import { Footer } from 'lib/components/Layout/Footer'
import { PageHeader } from 'lib/components/Layout/PageHeader'
import { SideNav } from 'lib/components/Layout/SideNav'
import React from 'react'

const Layout = (props) => (
  <DefaultLayout
    banner={null}
    header={<PageHeader />}
    content={props.children}
    sideNav={<SideNav />}
    bottomNav={<BottomNav />}
    footer={<Footer />}
  />
)

export default Layout
