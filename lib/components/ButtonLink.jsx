import React from 'react'
import classnames from 'classnames'
import Link from 'next/link'
import { pick, isUndefined } from 'lodash'

export function getButtonClasses(props) {
  let {
    border,
    bg,
    bold,
    text,
    hoverBg,
    hoverBorder,
    hoverText,
    noAnim,
    padding,
    rounded,
    secondary,
    selected,
    transition,
    className,
    textSize,
    width,
  } = props

  let defaultClasses = 'border-2 relative inline-block text-center leading-snug cursor-pointer outline-none focus:outline-none active:outline-none no-underline'
  let animClass = noAnim ? '' : 'button-scale'
  
  if (selected) {
    defaultClasses += ` opacity-50`
    animClass = ``
  }
  
  // eg. textSize='sm', textSize='xl'
  textSize = getTextSize(textSize)

  let defaultPadding = 'px-4 xs:px-6 sm:px-10 lg:px-12 py-2 sm:py-2'
  let defaultRounded = 'rounded-full'
  let defaultTrans = 'trans trans-fast'

  let defaultBorder = 'border-highlight-2'
  let defaultBg = 'bg-transparent'
  let defaultText = 'text-highlight-2'

  let defaultHoverBorder = 'hover:border-highlight-4'
  let defaultHoverBg = 'hover:bg-highlight-4'
  let defaultHoverText = 'hover:text-secondary'

  if (secondary) {
    defaultBorder = 'border-highlight-2 border-2'
    defaultBg = 'bg-primary'
    defaultText = 'text-highlight-2'

    defaultHoverBorder = 'hover:border-highlight-1'
    defaultHoverBg = 'hover:bg-body'
    defaultHoverText = 'hover:text-highlight-1'
  }

  bold = isUndefined(bold) ? 'font-bold' : ''

  padding = padding ? `${padding}` : defaultPadding
  rounded = rounded ? `rounded-${rounded}` : defaultRounded
  transition = transition ? `${transition}` : defaultTrans
  width = width ? `${width}` : ''

  border = border ? `border-${border}` : defaultBorder
  bg = bg ? `bg-${bg}` : defaultBg
  text = text ? `text-${text}` : defaultText

  hoverBorder = hoverBorder ? `hover:border-${hoverBorder}` : defaultHoverBorder
  hoverBg = hoverBg ? `hover:bg-${hoverBg}` : defaultHoverBg
  hoverText = hoverText ? `hover:text-${hoverText}` : defaultHoverText

  
  return classnames(
    className,
    defaultClasses,
    animClass,
    bold,
    bg,
    border,
    padding,
    rounded,
    text,
    hoverBg,
    hoverBorder,
    hoverText,
    textSize,
    transition,
    width
  )
}

const getTextSize = (size) => {
  switch (size) {
    case 'xxxs':
      return `text-xxxxs xs:text-xxxs sm:text-xxs lg:text-xs`
    case 'xxs':
      return `text-xxxs xs:text-xxs sm:text-xs lg:text-sm`
    case 'xs':
      return `text-xxs xs:text-xs sm:text-sm lg:text-base`
    case 'sm':
      return `text-xs xs:text-sm sm:text-base lg:text-lg`
    case 'lg':
      return `text-sm xs:text-lg sm:text-xl lg:text-2xl`
    case 'xl':
      return `text-lg xs:text-xl sm:text-2xl lg:text-3xl`
    case '2xl':
      return `text-xl xs:text-2xl sm:text-3xl lg:text-4xl`
    default:
      return `text-xxs xs:text-xs sm:text-sm lg:text-base`
  }
}

export function ButtonLink(props) {
  let {
    children,
    as,
    href,
  } = props

  const classes = getButtonClasses(props)

  const linkProps = pick(props, [
    'target',
    'rel',
  ])
  
  return <Link
    href={href}
    as={as}
    scroll={false}
  >
    <a
      {...linkProps}
      className={classes}
      onClick={(e) => e.stopPropagation()}
    >
      {children}
    </a>
  </Link>

}
