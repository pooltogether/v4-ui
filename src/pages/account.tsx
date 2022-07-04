import React from 'react'

import Layout from '@components/Layout'
import { AccountUI } from '@views/Account'

export default function IndexPage(props) {
  return (
    <Layout className='bg-gradient-to-br from-white to-pt-purple-lightest dark:from-gradient-purple dark:to-pt-purple-darkest'>
      <AccountUI />
    </Layout>
  )
}
