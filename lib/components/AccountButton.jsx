import React, { useContext } from 'react'
import classnames from 'classnames'
import { useAtom } from 'jotai'

import { AuthControllerContext } from 'lib/components/contextProviders/AuthControllerContextProvider'
import { transactionsAtom } from 'lib/atoms/transactionsAtom'
import { LoadingSpinner } from 'lib/components/LoadingSpinner'
import { PoolCountUp } from 'lib/components/PoolCountUp'
import { ProfileAvatar } from 'lib/components/ProfileAvatar'
import { ProfileName } from 'lib/components/ProfileName'
import { displayAmountInEther } from 'lib/utils/displayAmountInEther'

export function AccountButton(props) {
  const { openTransactions } = props

  const [transactions] = useAtom(transactionsAtom)

  const { ethBalance } = useContext(AuthControllerContext)

  
  

  const pendingTransactionsCount = transactions
    .filter(t => !t.completed)
    .length

  const pendingTxJsx = <>
    <div
      className='relative inline-block mr-1'
      style={{
        top: 3,
        transform: 'scale(0.7)'
      }}
    >
      <LoadingSpinner />
    </div> {pendingTransactionsCount} pending
  </>

  const ethBalanceNumber = ethBalance && Number(displayAmountInEther(
    ethBalance,
    { precision: 2 }
  ))

  return <>
    {(ethBalance || pendingTransactionsCount > 0) && <>
      <button
        onClick={openTransactions}
        className='flex items-center text-default-soft hover:text-inverse text-xxs sm:text-xs trans tracking-wider outline-none focus:outline-none active:outline-none hidden xs:block relative block mr-2 bg-default hover:bg-body rounded-l-full pl-2 xs:pl-3 pr-6 z-10 border-2 border-accent-4 hover:border-primary -mr-4 h-8'
      >
        {pendingTransactionsCount > 0 ? <>
          <span className='text-inverse hover:text-green font-bold'>
            {pendingTxJsx}
          </span>
        </> : <>
          <PoolCountUp
            start={0}
            end={ethBalanceNumber}
            decimals={2}
          /> ETH
        </>}
      </button>
    </>}

    <button
      onClick={openTransactions}
      className='text-highlight-2 font-bold hover:text-inverse text-xxs sm:text-sm trans trans-fastest tracking-wider outline-none focus:outline-none active:outline-none z-20 h-8'
    >
      <div
        className={classnames(
          'flex items-center bg-default hover:bg-body rounded-full border-2 border-highlight-2 px-2 trans trans-fastest z-20 h-8',
        )}
      >
        {pendingTransactionsCount > 0 && <>
          <div className='block xs:hidden text-green hover:text-inverse'>
            {pendingTxJsx}
          </div>
        </>}
        
        <ProfileAvatar /> <ProfileName />
      </div>
    </button>
  </>
}
