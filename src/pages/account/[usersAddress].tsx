import React from 'react'

import Layout from '@components/Layout'
import { SimpleAccountUI } from '@views/SimpleAccount'

export default function IndexPage(props) {
  return (
    <Layout>
      <SimpleAccountUI />
    </Layout>
  )
}
