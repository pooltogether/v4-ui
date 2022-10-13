import classNames from 'classnames'
import { motion, AnimatePresence, useReducedMotion, MotionStyle } from 'framer-motion'
import { useRouter } from 'next/router'
import React from 'react'
import { FadeInDiv } from './FadeInDiv'

interface PagePaddingProps {
  children?: React.ReactNode
  className?: string
  paddingClassName?: string
  widthClassName?: string
  marginClassName?: string
  style?: MotionStyle
}

export const PagePadding = (props: PagePaddingProps) => {
  const { className, style, children, paddingClassName, widthClassName, marginClassName } = props
  const router = useRouter()
  return (
    <FadeInDiv
      id={`page-padding-animation-wrapper-${router.pathname}`}
      className={classNames(paddingClassName, widthClassName, marginClassName, className)}
      style={style}
    >
      {children}
    </FadeInDiv>
  )
}

PagePadding.defaultProps = {
  paddingClassName: 'px-2 pb-20 pt-8',
  widthClassName: 'max-w-screen-lg',
  marginClassName: 'mx-auto'
}
