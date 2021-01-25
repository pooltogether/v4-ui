import React from 'react'
import classnames from 'classnames'

export const Card = (props) => {
  const { children, className, title } = props

  return (
    <>
      {title && <CardTitle>{title}</CardTitle>}
      <div
        className={classnames(
          'bg-default py-3 px-3 sm:py-6 sm:px-12 rounded-xl w-full mb-4 sm:mb-10 fadeIn animated',
          className
        )}
      >
        {children}
      </div>
    </>
  )
}

export const InnerCard = (props) => (
  <div
    className={classnames(
      'mx-auto py-2 px-8 sm:py-4 sm:px-12 bg-body bg-opacity-20 rounded-xl w-fit-content',
      props.className
    )}
  >
    {props.children}
  </div>
)

export const CardTitle = (props) => <h6 className='mb-4 text-accent-2'>{props.children}</h6>
