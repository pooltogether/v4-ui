import { LoadingScreen } from '@pooltogether/react-components'
import { DonateUI } from '@views/DonateUI'
import dynamic from 'next/dynamic.js'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'
import React, { Suspense } from 'react'
import nextI18NextConfig from '../../next-i18next.config.mjs'

const Layout = dynamic(() => import('../components/Layout'), {
  suspense: true
})

export async function getStaticProps({ locale }) {
  const translations = await serverSideTranslations(locale, ['common'], nextI18NextConfig)

  return {
    props: {
      ...translations
    }
  }
}

export default function Donate(props) {
  return (
    <Suspense fallback={<LoadingScreen />}>
      <Layout>
        <DonateUI />
      </Layout>
    </Suspense>
  )
}
