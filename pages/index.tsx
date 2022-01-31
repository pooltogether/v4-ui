import React from 'react'

import Layout from 'lib/components/Layout'
import { DepositUI } from 'lib/views/Deposit'

export default function IndexPage(props) {
  return (
    <Layout>
      <DepositUI />
      <div className='text-white mt-10 text-center'>v4-ui on pooldev</div>
    </Layout>
  )
}
