import React from 'react'

export function BlankStateMessage(props) {
  return (
    <div className='rounded-lg bg-card flex flex-col sm:flex-wrap sm:flex-row items-center justify-center text-center text-xl'>
      <div className='flex flex-col items-center justify-center text-center mx-2 sm:mx-10 px-10 py-10 text-xs sm:text-sm w-7/2'>
        {props.children}
      </div>
    </div>
  )
}
