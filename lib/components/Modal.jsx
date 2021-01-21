import React from 'react'
import FeatherIcon from 'feather-icons-react'
import { Dialog } from '@reach/dialog'

export function Modal(props) {
  const { handleClose, header, children, visible, zIndex } = props

  const nullFxn = (e) => {
    e.preventDefault()
  }

  const onDismiss = handleClose || nullFxn

  return (
    <>
      <Dialog aria-label='List of your transactions' isOpen={visible} onDismiss={onDismiss}>
        <div className='relative message bg-default text-inverse flex flex-col w-full sm:rounded-xl border-secondary sm:border-2 sm:shadow-4xl h-full sm:h-auto'>
          <div className='relative flex justify-between w-full border-b-2 border-secondary px-10 py-6 text-lg'>
            <h6>{header}</h6>

            {handleClose && (
              <button
                type='button'
                onClick={handleClose}
                className='text-inverse opacity-70 hover:opacity-100 trans outline-none focus:outline-none active:outline-none'
              >
                <FeatherIcon icon='x-circle' className='w-8 h-8' strokeWidth='0.09rem' />
              </button>
            )}
          </div>

          <div className='relative flex flex-col w-full px-10 py-6 text-sm'>{children}</div>
        </div>
      </Dialog>
    </>
  )
}
