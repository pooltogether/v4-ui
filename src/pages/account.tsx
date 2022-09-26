import { LoadingScreen } from '@pooltogether/react-components'
import { AccountUI } from '@views/Account'
import { SimpleAccountUI } from '@views/SimpleAccount'
import { isAddress } from 'ethers/lib/utils'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'
import dynamic from 'next/dynamic.js'
import { useRouter } from 'next/router'
import React, { Suspense } from 'react'
import nextI18NextConfig from '../../next-i18next.config.js'

const Layout = dynamic(() => import('../components/Layout'), {
  suspense: true
})

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
      <Suspense fallback={<LoadingScreen />}>
        <Layout>
          <SimpleAccountUI />
        </Layout>
      </Suspense>
    )
  }

  return (
    <Suspense fallback={<LoadingScreen />}>
      <Layout>
        <AccountUI />
      </Layout>
    </Suspense>
  )
}
