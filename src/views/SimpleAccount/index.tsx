import { NEGATIVE_HEADER_MARGIN } from '@components/Layout/PageHeader'
import { PagePadding } from '@components/Layout/PagePadding'
import { Card } from '@views/Account'
import { AccountCard } from '@views/Account/AccountCard'
import { OddsDisclaimer } from '@views/Account/OddsDisclaimer'
import { POOLBalancesCard } from '@views/Account/POOLBalancesCard'
import { GovernanceSidebarCard } from '@views/Account/SidebarCard/GovernanceSidebarCard'
import { OddsSidebarCard } from '@views/Account/SidebarCard/OddsSidebarCard'
import { PastPrizesSidebarCard } from '@views/Account/SidebarCard/PastPrizesSidebarCard'
import classNames from 'classnames'
import { useRouter } from 'next/router'
import React from 'react'
import { SimpleV4DepositList, SimpleV3DepositList } from './DepositLists'

export const SimpleAccountUI = (props: { usersAddress: string }) => {
  const { usersAddress } = props

  return (
    <PagePadding className='grid gap-4 grid-cols-1 sm:grid-cols-3 md:grid-cols-4'>
      <div className='sm:col-span-2 md:col-span-3 space-y-4'>
        <AccountCard usersAddress={usersAddress} showAddress />
        <Card>
          <SimpleV4DepositList usersAddress={usersAddress} />
          <SimpleV3DepositList usersAddress={usersAddress} />
          <POOLBalancesCard usersAddress={usersAddress} />
        </Card>
        <OddsDisclaimer className='block mt-6' />
      </div>
      <div className='hidden sm:flex sm:flex-col space-y-4'>
        <PastPrizesSidebarCard usersAddress={usersAddress} />
        <OddsSidebarCard usersAddress={usersAddress} />
        <GovernanceSidebarCard usersAddress={usersAddress} />
      </div>
    </PagePadding>
  )
}
