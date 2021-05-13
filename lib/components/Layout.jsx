import React, { useContext, useEffect, useState } from 'react'
import classnames from 'classnames'
import { useRouter } from 'next/router'
import { AnimatePresence, motion, useViewportScroll } from 'framer-motion'

import { SUPPORTED_CHAIN_IDS } from 'lib/constants'
import { AuthControllerContext } from 'lib/components/contextProviders/AuthControllerContextProvider'
import { NavAccount } from 'lib/components/NavAccount'
import { HeaderLogo } from 'lib/components/HeaderLogo'
import { NavMobile } from 'lib/components/NavMobile'
import { NetworkText } from 'lib/components/NetworkText'
import { Meta } from 'lib/components/Meta'
import { Nav } from 'lib/components/Nav'
import { PendingTxButton } from 'lib/components/PendingTxButton'
import { LanguagePicker } from 'lib/components/LanguagePicker'
import { Settings } from 'lib/components/Settings'
import { WrongNetworkModal } from 'lib/components/WrongNetworkModal'
import { NavPoolBalance } from 'lib/components/NavPoolBalance'
import { chainIdToNetworkName } from 'lib/utils/chainIdToNetworkName'
import { Button } from 'lib/components/Button'

const onlyUnique = (value, index, self) => {
  return self.indexOf(value) === index
}

export function Layout(props) {
  const { children } = props

  const { usersAddress, chainId, walletName, connectWallet } = useContext(AuthControllerContext)

  const [yScrollPosition, setYScrollPosition] = useState()
  const { scrollY } = useViewportScroll()

  scrollY.onChange((y) => {
    setYScrollPosition(y)
  })

  const [showTransactionsDialog, setShowTransactionsDialog] = useState(false)

  const openTransactions = (e) => {
    e.preventDefault()
    setShowTransactionsDialog(true)
  }

  const closeTransactions = (e) => {
    if (e) {
      e.preventDefault()
    }
    setShowTransactionsDialog(false)
  }

  const router = useRouter()

  let supportedNetworkNames = SUPPORTED_CHAIN_IDS.map((chainId) => chainIdToNetworkName(chainId))
  supportedNetworkNames = supportedNetworkNames.filter(onlyUnique)

  return (
    <>
      <Meta />

      <WrongNetworkModal />

      <div
        className='flex flex-col w-full'
        style={{
          minHeight: '100vh'
        }}
      >
        <motion.div className='header fixed w-full bg-body z-30 pt-1 pb-1 xs:pt-2 xs:pb-0 sm:py-0 mx-auto l-0 r-0'>
          <div className='flex justify-between items-center px-4 xs:px-12 sm:px-10 py-4 xs:pb-6 sm:pt-5 sm:pb-7 mx-auto'>
            <HeaderLogo />

            <div
              className={classnames('flex items-center justify-end flex-row flex-wrap relative')}
              style={{
                lineHeight: 0
              }}
            >
              {usersAddress && chainId && chainId !== 1 && (
                <NetworkText openTransactions={openTransactions} />
              )}

              <NavPoolBalance />

              {!usersAddress && (
                <Button padding='px-4 sm:px-6 py-1' onClick={() => connectWallet()} textSize='xxxs'>
                  Connect wallet
                </Button>
              )}

              {usersAddress && (
                <NavAccount
                  openTransactions={openTransactions}
                  closeTransactions={closeTransactions}
                  showTransactionsDialog={showTransactionsDialog}
                />
              )}

              {/* this pushes the lang picker and settings gear onto it's own roll on mobile/tablet */}
              <div className='w-full sm:hidden'></div>

              <PendingTxButton openTransactions={openTransactions} />

              <LanguagePicker />

              <Settings />
            </div>
          </div>

          <motion.div
            className='w-full'
            style={{
              boxShadow: 'rgba(0, 0, 0, 0.025) 0px 0px 1px 1px, rgba(0, 0, 0, 0.1) 0px 1px 7px 1px',
              height: 0,
              maxWidth: '100vw'
            }}
            animate={yScrollPosition > 1 ? 'enter' : 'exit'}
            variants={{
              enter: {
                opacity: 1,
                transition: {
                  duration: 1
                }
              },
              exit: {
                opacity: 0
              }
            }}
          ></motion.div>
        </motion.div>

        <div className='grid-wrapper'>
          <div className='sidebar hidden sm:block z-20'>
            <Nav />
          </div>

          <div className='content'>
            <div className='pool-container w-full flex flex-grow relative z-10 h-full page px-4 xs:px-12 sm:px-10 pt-6 xs:pt-6 sm:pt-8 pb-24 sm:pb-0'>
              <div className='flex flex-col flex-grow'>
                <div
                  className='relative flex flex-col flex-grow h-full z-10 text-white'
                  style={{
                    flex: 1
                  }}
                >
                  <div className='my-0 text-inverse sm:pt-2 lg:pt-4 pb-40'>
                    {React.cloneElement(children, {
                      ...props
                    })}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <NavMobile />
      </div>
    </>
  )
}
