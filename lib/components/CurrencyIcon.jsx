import React from 'react'
import classnames from 'classnames'
import { isUndefined } from 'lodash'
import { motion } from 'framer-motion'

import { useCoingeckoTokenInfoQuery } from 'lib/hooks/useCoingeckoTokenInfoQuery'

// This was separated into it's own component to comply with the rules of hooks
const CoingeckoOrPlaceholder = (props) => {
  const { address, className } = props

  let src

  console.log(address)
  // Check Coingecko for img
  const { data: tokenInfo } = useCoingeckoTokenInfoQuery(address)
  src = tokenInfo?.image?.small
  console.log(tokenInfo)

  // Fallback to placeholder
  if (!src) {
    src = '/eth-placeholder.png'
  }

  return (
    <motion.img
      src={src}
      className={className}
      animate={{ opacity: 1 }}
      initial={{ opacity: 0 }}
      exit={{ opacity: 0 }}
    />
  )
}

export const CurrencyIcon = (props) => {
  const { className, noMediaQueries, sm, md, lg, xl, xs, address } = props
  let { sizeClasses } = props

  const noMargin = props.noMargin || false

  if (!sizeClasses && isUndefined(noMediaQueries)) {
    if (xs) {
      sizeClasses = 'w-3 h-3 sm:w-5 sm:h-5 lg:w-6 lg:h-6'
    } else if (sm) {
      sizeClasses = 'w-4 h-4 sm:w-6 sm:h-6 lg:w-8 lg:h-8'
    } else if (md) {
      sizeClasses = 'w-6 h-6 sm:w-10 sm:h-10'
    } else if (lg) {
      sizeClasses = 'w-8 h-8 sm:w-14 sm:h-14'
    } else if (xl) {
      sizeClasses = 'w-12 h-12 sm:w-16 sm:h-16 lg:w-18 lg:h-18'
    }
  } else if (!sizeClasses) {
    if (md) {
      sizeClasses = 'w-9 h-9'
    } else if (lg) {
      sizeClasses = 'w-10 h-10'
    } else if (xl) {
      sizeClasses = 'w-12 h-12'
    } else {
      sizeClasses = 'w-8 h-8'
    }
  }

  const classes = classnames(sizeClasses, {
    [className]: className,
    'inline-block': !className,
    'mr-1': !noMargin
  })

  return <CoingeckoOrPlaceholder address={address} className={classes} />
}
