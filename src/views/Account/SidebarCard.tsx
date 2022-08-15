import { TransparentDiv } from '@components/TransparentDiv'
import { ExternalLink } from '@pooltogether/react-components'
import classNames from 'classnames'
import React, { ReactNode } from 'react'
import { AccentTextButton } from './AccentTextButton'

export const SidebarCard: React.FC<{
  title: ReactNode
  description: ReactNode
  main: ReactNode
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
}> = (props) => (
  <TransparentDiv className='rounded-lg px-4 py-2 flex flex-col'>
    <div className='font-bold text-lg'>{props.title}</div>
    <div className='text-xxs opacity-70'>{props.description}</div>
    <div className='font-bold text-xl'>{props.main}</div>
    {props.showTrigger && (
      <AccentTextButton onClick={props.onClick} disabled={props.disabled}>
        {props.trigger}
      </AccentTextButton>
    )}
    {props.showLink && (
      <>
        <ExternalLink
          href={props.href}
          rel='noopener noreferrer'
          theme={'text-gradient-magenta hover:opacity-70 trans text-lg font-bold text-left'}
        >
          {props.link}
        </ExternalLink>
      </>
    )}
  </TransparentDiv>
)
