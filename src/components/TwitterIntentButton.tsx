import { SquareLink } from '@pooltogether/react-components'
import classNames from 'classnames'
import React from 'react'
import { useTranslation } from 'next-i18next'

interface TwitterIntentButtonProps {
  text: string
  url: string
}

export const TwitterIntentButton = (props: TwitterIntentButtonProps) => {
  const { url, text } = props
  const { t } = useTranslation()

  return (
    <SquareLink
      href={`http://twitter.com/intent/tweet?text=${text}&url=${url}`}
      target='_blank'
      className='w-full flex items-center mx-auto mt-4'
    >
      <TwitterIconSvg className='w-5 mr-2' /> {t('shareTweet', 'Share Tweet')}
    </SquareLink>
  )
}

export const TwitterIconSvg = (props) => {
  return (
    <svg
      {...props}
      className={classNames(props.className, 'fill-current')}
      width='100%'
      viewBox='0 0 21 16'
      fill='none'
      xmlns='http://www.w3.org/2000/svg'
    >
      <path d='M6.604 16c7.925 0 12.259-6.156 12.259-11.495 0-.175 0-.349-.013-.522A8.484 8.484 0 0021 1.892a9.05 9.05 0 01-2.475.635A4.112 4.112 0 0020.42.293a8.991 8.991 0 01-2.736.98 4.408 4.408 0 00-2.445-1.22 4.563 4.563 0 00-2.732.425 4.162 4.162 0 00-1.893 1.896 3.813 3.813 0 00-.273 2.584 12.874 12.874 0 01-4.918-1.225A12.12 12.12 0 011.462.737 3.826 3.826 0 00.99 3.681c.248 1.002.893 1.878 1.806 2.45A4.496 4.496 0 01.84 5.623v.052c0 .932.345 1.836.975 2.558a4.368 4.368 0 002.482 1.402 4.58 4.58 0 01-1.946.07 4.064 4.064 0 001.533 2.007 4.502 4.502 0 002.492.798 9.018 9.018 0 01-5.35 1.733c-.343-.001-.686-.02-1.026-.059a12.795 12.795 0 006.604 1.812' />
    </svg>
  )
}
