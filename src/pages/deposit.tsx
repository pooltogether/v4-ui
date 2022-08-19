import React from 'react'

import Layout from '@components/Layout'
import { DepositUI } from '@views/Deposit'

export default function IndexPage(props) {
  return (
    <Layout className='bg-pt-purple-lightest dark:bg-pt-purple-darkest'>
      <DepositUI />
    </Layout>
  )
}
