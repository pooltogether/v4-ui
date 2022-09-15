import Layout from '@components/Layout'
import { AccountUI } from '@views/Account'
import { SimpleAccountUI } from '@views/SimpleAccount'
import { isAddress } from 'ethers/lib/utils'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'
import { useRouter } from 'next/router'
import React from 'react'
import nextI18NextConfig from '../../next-i18next.config.js'

export async function getStaticProps({ locale }) {
  return {
    props: {
      ...(await serverSideTranslations(locale, ['common'], nextI18NextConfig))
    }
  }
}

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
