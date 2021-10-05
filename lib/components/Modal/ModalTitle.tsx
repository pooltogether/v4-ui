import { NetworkIcon } from '@pooltogether/react-components'
import classNames from 'classnames'
import React from 'react'

interface ModalTitleProps {
  className?: string
  title: string
  chainId: number
}

export const ModalTitle = (props: ModalTitleProps) => {
  const { className, title, chainId } = props
  return (
    <div className={classNames('flex flex-col mx-auto', className)}>
      <NetworkIcon chainId={chainId} className='mx-auto mb-2' sizeClassName='w-8 h-8' />
      <div className='mx-auto text-2xl font-bold text-white'>{title}</div>
    </div>
  )
}
