import { ThemedClipSpinner } from '.yalc/@pooltogether/react-components/dist'
import classNames from 'classnames'
import React from 'react'

interface ModalLoadingGateProps {
  className?: string
}

export const ModalLoadingGate = (props: ModalLoadingGateProps) => {
  const { className } = props

  return (
    <div className={classNames(className, 'flex flex-col text-accent-1')}>
      <ThemedClipSpinner className='mx-auto mb-8' sizeClassName='w-10 h-10' />
      <p className='mb-4 text-center mx-8'>
        We're getting some more data to make sure you can deposit.
      </p>
      <p className='text-center mx-8'>This might take a few seconds.</p>
    </div>
  )
}
