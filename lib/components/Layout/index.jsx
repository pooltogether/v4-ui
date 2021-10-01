import React from 'react'

import { SimpleLayout } from '@pooltogether/react-components'
import { Footer } from 'lib/components/Layout/Footer'
import { PageHeader } from 'lib/components/Layout/PageHeader'

const Layout = (props) => (
  <SimpleLayout
    banner={null}
    header={<PageHeader />}
    content={props.children}
    footer={<Footer />}
  />
)

export default Layout
