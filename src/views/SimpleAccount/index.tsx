import { PagePadding } from '@components/Layout/PagePadding'
import { AccountCard } from '@views/Account/AccountCard'
import { OddsDisclaimer } from '@views/Account/OddsDisclaimer'
import { POOLBalancesCard } from '@views/Account/POOLBalancesCard'
import { useRouter } from 'next/router'
import React from 'react'
import { SimpleV4DepositList, SimpleV3DepositList } from './DepositLists'

export const SimpleAccountUI = (props: { usersAddress: string }) => {
  const { usersAddress } = props

  return (
    <PagePadding className='space-y-8' widthClassName='max-w-screen-xs'>
      <AccountCard usersAddress={usersAddress} showAddress />
      <SimpleV4DepositList usersAddress={usersAddress} />
      <SimpleV3DepositList usersAddress={usersAddress} />
      <POOLBalancesCard usersAddress={usersAddress} />
      <OddsDisclaimer className='block mt-6' />
    </PagePadding>
  )
}
