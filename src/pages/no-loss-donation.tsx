import { getCoingeckoExchangeRates } from '@pooltogether/hooks'
import { LoadingScreen } from '@pooltogether/react-components'
import { DonateUI } from '@views/DonateUI'
import { useHydrateAtoms } from 'jotai/utils'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'
import dynamic from 'next/dynamic.js'
import React, { Suspense } from 'react'
import nextI18NextConfig from '../../next-i18next.config.js'
import { exchangeRatesAtom } from '../serverAtoms'

const Layout = dynamic(() => import('../components/Layout'), {
  suspense: true
})

export async function getStaticProps({ locale }) {
  const translations = await serverSideTranslations(locale, ['common'], nextI18NextConfig)
  const exchangeRates = await getCoingeckoExchangeRates()

  return {
    props: {
      ...translations,
      exchangeRates
    },
    revalidate: 86400
  }
}

export default function Donate(props) {
  const { exchangeRates } = props

  useHydrateAtoms([[exchangeRatesAtom, exchangeRates]])

  return (
    <Suspense fallback={<LoadingScreen />}>
      <Layout>
        <DonateUI />
      </Layout>
    </Suspense>
  )
}
