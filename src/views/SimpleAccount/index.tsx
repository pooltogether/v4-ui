
import { PagePadding } from '@components/Layout/PagePadding'
import { AccountCard } from '@views/Account/AccountCard'
import { OddsDisclaimer } from '@views/Account/OddsDisclaimer'
import { POOLBalancesCard } from '@views/Account/POOLBalancesCard'
import { useRouter } from 'next/router'
import React from 'react'

import { SimpleV4DepositList, SimpleV3DepositList } from './DepositLists'

export const SimpleAccountUI = () => {
  const router = useRouter()
  const usersAddress = router.query.user as string

  return (
    <PagePadding className='space-y-8'>
      <AccountCard usersAddress={usersAddress} showAddress />
      <SimpleV4DepositList usersAddress={usersAddress} />
      <SimpleV3DepositList usersAddress={usersAddress} />
      <POOLBalancesCard usersAddress={usersAddress} />
      <OddsDisclaimer className='block mt-6' />
    </PagePadding>
  )
}
