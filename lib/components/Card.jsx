import React from 'react'
import classnames from 'classnames'

export const Card = (props) => {
  const { children, className, disabled, title } = props

  return (
    <>
      {title && <CardTitle>{title}</CardTitle>}
      <div
        className={classnames(
          'bg-default py-4 px-4 sm:py-6 sm:px-10 rounded-xl w-full mb-4 sm:mb-10 trans',
          className,
          { 'opacity-40': disabled }
        )}
      >
        {children}
      </div>
    </>
  )
}

export const InnerCard = (props) => (
  <div
    className={classnames('mx-auto py-4 px-8 sm:py-8 sm:px-10 bg-body rounded-xl', props.className)}
  >
    {props.children}
  </div>
)

export const CardTitle = (props) => <h6 className='mb-4 text-accent-2'>{props.children}</h6>
