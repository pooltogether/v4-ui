import React from 'react'
import Link from 'next/link'
import classnames from 'classnames'
import { motion } from 'framer-motion'

export const InteractableCard = (
  props,
) => {  
  const selected = props.selected
  const className = props.className

  return <>
    <motion.li
      onClick={props.onClick}

      whileHover={{
        y: selected ? 0 : -2
      }}
      whileTap={{ y: 1, scale: 0.98 }}
      className={classnames(
        className,
        'interactable-card bg-card hover:bg-card-selected border-card w-full mb-4 trans rounded-lg text-inverse hover:text-inverse',
        {
          'hover:shadow-xl cursor-pointer': !selected,
          'selected': selected,
        }
      )}
      style={{
        minHeight: 120
      }}
    >
      <Link
        href={props.href}
        as={props.as}
      >
        <a
          className='px-4 sm:px-10 pt-3 pb-8 inline-block w-full'
        >
          {props.children}
        </a>
      </Link>
    </motion.li>
  </>
}
