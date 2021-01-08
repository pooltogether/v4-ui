import React from 'react'
import classnames from 'classnames'
import { motion } from 'framer-motion'

export const NonInteractableCard = (
  props,
) => {  
  const className = props.className

  return <>
    <motion.div
      className={classnames(
        className,
        'interactable-card bg-card border-card w-full px-4 xs:px-6 mb-4 py-5 sm:py-6 trans rounded-lg text-inverse',
      )}
      style={{
        minHeight: 120
      }}
      animate={{
        scale: 1,
        y: 0,
        opacity: 1,
        transition: {
          duration: 0.2,
          staggerChildren: 0.5,
          delayChildren: 0.2
        }
      }}
      exit={{
        scale: 0,
        y: -10,
        opacity: 0,
        transition: { staggerChildren: 0.05, staggerDirection: -1 }
      }}
    >
      {props.children}
    </motion.div>
  </>
}
