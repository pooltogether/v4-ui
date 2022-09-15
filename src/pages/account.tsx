
import Layout from '@components/Layout'
import { AccountUI } from '@views/Account'
import { SimpleAccountUI } from '@views/SimpleAccount'
import { isAddress } from 'ethers/lib/utils'
import { useRouter } from 'next/router'
import React from 'react'

export default function IndexPage(props) {
  const router = useRouter()
  const user = router.query.user as string

  if (!!user && isAddress(user)) {
    return (
      <Layout>
        <SimpleAccountUI />
      </Layout>
    )
  }

  return (
    <Layout>
      <AccountUI />
    </Layout>
  )
}
