import Layout from '@components/Layout'
import { DepositUI } from '@views/Deposit'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'
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
  return (
    <Layout>
      <DepositUI />
    </Layout>
  )
}
