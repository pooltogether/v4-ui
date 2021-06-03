import React from 'react'
import { motion } from 'framer-motion'

import { V3LoadingDots } from 'lib/components/V3LoadingDots'

import PoolTogetherMark from 'assets/images/pooltogether-white-mark.svg'

export function LoadingScreen(props) {
  const { initialized } = props

  // TODO: Add back motion
  return (
    <div>
      <img src={PoolTogetherMark} className='w-8 outline-none -mt-20' style={{ borderWidth: 0 }} />
      <div className='overflow-hidden'>
        <V3LoadingDots />
      </div>
    </div>
  )

  return (
    <motion.div
      animate={!initialized ? 'enter' : 'exit'}
      transition={{ duration: 0.5, ease: 'easeIn' }}
      variants={{
        initial: {
          opacity: 1
        },
        enter: {
          opacity: 1
        },
        exit: {
          opacity: 0,
          transitionEnd: {
            display: 'none'
          }
        }
      }}
      className='h-screen w-screen fixed overflow-hidden t-0 r-0 l-0 b-0 text-white flex flex-col items-center justify-center'
      style={{
        backgroundColor: '#1E0B43',
        color: 'white',
        zIndex: 12345678
      }}
    >
      <img src={PoolTogetherMark} className='w-8 outline-none -mt-20' style={{ borderWidth: 0 }} />

      <div className='overflow-hidden'>
        <V3LoadingDots />
      </div>
    </motion.div>
  )
}
