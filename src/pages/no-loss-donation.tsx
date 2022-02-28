import React from 'react'

import Layout from '@components/Layout'
import { PagePadding } from '@components/Layout/PagePadding'
import { DonateUI } from '@views/DonateUI'

export default function Donate(props) {
  return (
    <Layout>
      <DonateUI />
    </Layout>
  )
}
