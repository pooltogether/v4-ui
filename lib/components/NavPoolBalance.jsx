import { Dialog } from '@reach/dialog'
import FeatherIcon from 'feather-icons-react'
import React, { useState } from 'react'

import { useTranslation } from 'lib/../i18n'
import { getPrecision, numberWithCommas } from 'lib/utils/numberWithCommas'
import Squiggle from 'assets/images/squiggle.svg'
import PoolIcon from 'assets/images/pool-icon.svg'
import { usePoolTokenData } from 'lib/hooks/usePoolTokenData'
import { useTotalClaimablePool } from 'lib/hooks/useTotalClaimablePool'
import { NumberCountUp } from 'lib/components/NumberCountUp'

export const NavPoolBalance = () => {
  const [isOpen, setIsOpen] = useState(false)
  const openModal = () => setIsOpen(true)
  const closeModal = () => setIsOpen(false)

  const { data: tokenData, isFetched } = usePoolTokenData()

  if (!isFetched || !tokenData) {
    return null
  }

  const { usersBalance } = tokenData

  return (
    <>
      <div
        className='relative test text-green hover:text-white font-bold cursor-pointer pool-gradient-1 rounded-full px-3 xs:px-4 p-2 leading-none trans mr-2 flex'
        onClick={openModal}
      >
        <span className='hidden sm:block mr-2'>
          <NumberCountUp
            amount={usersBalance}
            decimals={getPrecision(usersBalance)}
          />
        </span>
        POOL
      </div>
      <PoolBalanceModal isOpen={isOpen} closeModal={closeModal} tokenData={tokenData} />
    </>
  )
}

const PoolBalanceModal = (props) => {
  const { t } = useTranslation()
  const { isOpen, closeModal, tokenData } = props
  const { usersBalance, totalSupply } = tokenData

  const { total: totalClaimablePool, isFetched: totalClaimableIsFetched } = useTotalClaimablePool()

  if (!totalClaimableIsFetched) {
    return null
  }

  const totalClaimablePoolFormatted = numberWithCommas(totalClaimablePool, {
    precision: getPrecision(totalClaimablePool)
  })
  const formattedBalance = numberWithCommas(usersBalance, {
    precision: getPrecision(usersBalance)
  })
  const formattedTotalSupply = numberWithCommas(totalSupply, {
    precision: 0
  })

  return (
    <Dialog aria-label='POOL Token Details Modal' isOpen={isOpen} onDismiss={closeModal}>
      <div className='text-inverse p-4 bg-card h-full sm:h-auto rounded-none sm:rounded-xl sm:max-w-sm mx-auto flex flex-col'>
        <div className='flex'>
          <button
            className='my-auto ml-auto close-button trans text-inverse hover:opacity-30'
            onClick={closeModal}
          >
            <FeatherIcon icon='x' className='w-6 h-6' />
          </button>
        </div>

        <div className='flex mx-auto'>
          <img src={PoolIcon} className='shadow-xl rounded-full w-28 h-28 spinningCoin' />
          <div className='flex flex-col ml-8 justify-center mr-8'>
            <h3>{numberWithCommas(usersBalance, { precision: getPrecision(usersBalance) })}</h3>
            <span className='text-accent-1'>POOL</span>
          </div>
        </div>

        <div className='bg-body p-4 rounded-xl mt-8'>
          <div className='flex justify-between'>
            <span className='text-accent-1'>{t('balance')}:</span>
            <span className='font-bold'>{formattedBalance}</span>
          </div>

          <div className='flex justify-between'>
            <span className='text-accent-1'>{t('unclaimed')}:</span>
            <span className='font-bold'>{totalClaimablePoolFormatted}</span>
          </div>

          <img src={Squiggle} className='mx-auto my-2' />

          <div className='flex justify-between'>
            <span className='text-accent-1'>{t('totalSupply')}:</span>
            <span className='font-bold'>{formattedTotalSupply}</span>
          </div>
        </div>
      </div>
    </Dialog>
  )
}
