import { LoadingScreen } from '@pooltogether/react-components'
import { SimpleAccountUI } from '@views/SimpleAccount'
import { isAddress } from 'ethers/lib/utils'
import dynamic from 'next/dynamic.js'
import { useRouter } from 'next/router'
import React, { Suspense, useEffect } from 'react'

const Layout = dynamic(() => import('../../components/Layout'), {
  suspense: true
})

export default function IndexPage() {
  const router = useRouter()
  const { usersAddress } = router.query

  useEffect(() => {
    if (Array.isArray(usersAddress) || !isAddress(usersAddress)) {
      router.replace(`/`)
    }
  }, [usersAddress, router])

  return (
    <Suspense fallback={<LoadingScreen />}>
      <Layout>
        <SimpleAccountUI
          usersAddress={Array.isArray(usersAddress) ? usersAddress[0] : usersAddress}
        />
      </Layout>
    </Suspense>
  )
}
