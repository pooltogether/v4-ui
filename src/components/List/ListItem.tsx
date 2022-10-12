import classNames from 'classnames'
import FeatherIcon from 'feather-icons-react'
import Link from 'next/link'

export const LoadingListItem: React.FC<{ className?: string; bgClassName?: string }> = (props) => {
  const { bgClassName, className, ...listItemProps } = props
  return <li {...listItemProps} className={classNames(className, bgClassName)} />
}

LoadingListItem.defaultProps = {
  bgClassName:
    'bg-white bg-opacity-0 hover:bg-opacity-10 dark:bg-actually-black dark:bg-opacity-0 dark:hover:bg-opacity-10 animate-pulse'
}

export const ListItem: React.FC<{
  left: React.ReactNode
  right: React.ReactNode
  bottom?: React.ReactNode
  bgClassName?: string
  radiusClassName?: string
  onClick?: () => void
  internalHref?: string
  externalHref?: string
}> = (props) => {
  const { onClick, bgClassName, radiusClassName, left, right, bottom, internalHref, externalHref } =
    props

  let Container = (props) => (
    <div {...props} className='py-1 px-2 w-full flex justify-between items-center' />
  )
  let icon
  if (!!onClick) {
    // eslint-disable-next-line react/display-name
    Container = (props) => (
      <button
        {...props}
        onClick={onClick}
        className='py-1 px-2 w-full flex justify-between items-center'
      />
    )
    icon = 'chevron-right'
  } else if (!!internalHref) {
    // eslint-disable-next-line react/display-name
    Container = (props) => (
      <Link href={internalHref}>
        <a {...props} className='py-1 px-2 w-full flex justify-between items-center' />
      </Link>
    )
    icon = 'external-link'
  } else if (!!externalHref) {
    // eslint-disable-next-line react/display-name
    Container = (props) => (
      <a
        {...props}
        href={externalHref}
        rel='noreferrer noopener'
        className='py-1 px-2 w-full flex justify-between items-center'
      />
    )
    icon = 'arrow-up-right'
  }

  return (
    <li className={classNames('transition', bgClassName, radiusClassName)}>
      <Container>
        <div className='text-xs xs:text-sm sm:text-lg font-bold text-left'>{left}</div>
        <div className='flex space-x-2 items-center'>
          {right}
          {!!icon && <FeatherIcon icon={icon} className='w-6 h-6 opacity-50' />}
        </div>
      </Container>
      {bottom}
    </li>
  )
}

ListItem.defaultProps = {
  bgClassName:
    'bg-white bg-opacity-0 hover:bg-opacity-100 dark:bg-actually-black dark:bg-opacity-0 dark:hover:bg-opacity-25',
  radiusClassName: 'rounded-lg'
}
