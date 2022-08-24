import { CardTitle } from '@components/Text/CardTitle'
import { TransparentDiv } from '@components/TransparentDiv'
import { ExternalLink } from '@pooltogether/react-components'
import classNames from 'classnames'
import React, { ReactNode } from 'react'
import { AccentTextButton } from '../AccentTextButton'

export const SidebarCard: React.FC<{
  title: ReactNode
  description: ReactNode
  main: ReactNode
  isLoading?: boolean
  // Link
  link?: ReactNode
  links?: ReactNode[]
  href?: string
  showLink?: boolean
  // Button
  onClick?: () => void
  showTrigger?: boolean
  trigger?: ReactNode
  disabled?: boolean
  className?: string
}> = (props) => (
  <div
    className={classNames(
      'sm:bg-white sm:bg-opacity-100 sm:dark:bg-actually-black sm:dark:bg-opacity-10',
      'rounded-lg sm:px-4 sm:py-2 flex flex-col',
      props.className
    )}
  >
    <CardTitle title={props.title} loading={props.isLoading} className='mb-2 sm:mb-0' />
    <div className='text-xxs dark:text-white text-pt-purple-darkest text-opacity-50 dark:text-opacity-50 font-light'>
      {props.description}
    </div>
    <div className='font-bold text-xl'>{props.main}</div>
    {props.showTrigger && (
      <AccentTextButton
        onClick={props.onClick}
        disabled={props.disabled}
        className='ml-4 sm:ml-0 mt-4 sm:mt-0'
      >
        {props.trigger}
      </AccentTextButton>
    )}
    {props.showLink && (
      <>
        <ExternalLink
          href={props.href}
          rel='noopener noreferrer'
          theme={'text-gradient-magenta hover:opacity-70 trans text-lg font-bold text-left'}
          className='ml-4 sm:ml-0 mt-4 sm:mt-0'
        >
          {props.link}
        </ExternalLink>
      </>
    )}
  </div>
)
