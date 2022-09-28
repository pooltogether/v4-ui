import { PagePadding } from '@components/Layout/PagePadding'
import { JsonRpcProvider } from '@ethersproject/providers'
import { CHAIN_ID } from '@pooltogether/wallet-connection'
import React from 'react'
import { DepositTrigger } from './DepositTrigger'
import { Footer } from './Footer'
import { NetworkCarousel } from './NetworkCarousel'

console.log(
  new JsonRpcProvider(
    'https://optimism-mainnet.infura.io/v3/5e378f49a3994737940a897b2d95222b',
    CHAIN_ID.optimism
  ),
  new JsonRpcProvider('https://mainnet.optimism.io', CHAIN_ID.optimism)
)

export const DepositUI = () => {
  return (
    <PagePadding
      paddingClassName=''
      widthClassName=''
      marginClassName=''
      className='absolute inset-0'
    >
      <div className='mx-auto h-full flex flex-col'>
        <div className='h-full flex flex-col justify-evenly sm:justify-center pt-11 sm:pt-16 space-y-12 xs:space-y-20 md:space-y-28'>
          <NetworkCarousel />
          <DepositTrigger />
        </div>
        <Footer />
      </div>
    </PagePadding>
  )
}
