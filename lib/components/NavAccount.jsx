import React, { useContext, useState } from 'react'
import VisuallyHidden from '@reach/visually-hidden'
import FeatherIcon from 'feather-icons-react'
import { motion } from 'framer-motion'
import { Dialog } from '@reach/dialog'

import { AccountButton } from 'lib/components/AccountButton'
import { AuthControllerContext } from 'lib/components/contextProviders/AuthControllerContextProvider'
import { TransactionsList } from 'lib/components/TransactionsList'
import { WalletInfo } from 'lib/components/WalletInfo'

export function NavAccount(props) {
  const { openTransactions, closeTransactions, showTransactionsDialog } = props

  const { usersAddress } = useContext(AuthControllerContext)

  return (
    <>
      {usersAddress && (
        <>
          <AccountButton openTransactions={openTransactions} />
        </>
      )}

      {usersAddress && (
        <>
          <Dialog
            aria-label='List of your transactions'
            isOpen={showTransactionsDialog}
            onDismiss={closeTransactions}
          >
            <motion.div
              id='transactions-ui'
              className={'relative text-sm sm:text-base lg:text-lg h-full'}
              key='sign-in-scaled-bg'
              animate={showTransactionsDialog ? 'enter' : 'exit'}
              variants={{
                exit: {
                  scale: 0,
                  transition: {
                    duration: 0.1,
                    staggerChildren: 0.1
                  }
                },
                enter: {
                  scale: 1,
                  transition: {
                    duration: 0.1,
                    staggerChildren: 0.1
                  }
                },
                initial: {
                  scale: 0
                }
              }}
            >
              <div className='flex flex-col items-center justify-center h-full w-full '>
                <div className='dialog-inner relative message bg-primary text-inverse flex flex-col w-full shadow-4xl'>
                  <div className='flex justify-between items-start px-8 sm:px-10 pt-8 pb-5 bg-default rounded-xl rounded-b-none'>
                    <WalletInfo closeTransactions={closeTransactions} />

                    <button
                      onClick={closeTransactions}
                      className='absolute r-0 t-0 pr-6 pt-6 pb-4 pl-4 close-button text-highlight-2 hover:text-highlight-1 trans outline-none focus:outline-none active:outline-none opacity-50 hover:opacity-100'
                    >
                      <VisuallyHidden>Close</VisuallyHidden>
                      <span aria-hidden>
                        <FeatherIcon icon='x-circle' className='w-6 h-6' />
                      </span>
                    </button>
                  </div>

                  <TransactionsList
                    closeTransactions={closeTransactions}
                    showTransactionsDialog={showTransactionsDialog}
                  />
                </div>
              </div>
            </motion.div>
          </Dialog>
        </>
      )}
    </>
  )
}
