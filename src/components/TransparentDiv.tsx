import classNames from 'classnames'
import { DetailedHTMLProps, HTMLAttributes } from 'react'

export const TransparentDiv: React.FC<
  DetailedHTMLProps<HTMLAttributes<HTMLDivElement>, HTMLDivElement>
> = (props) => (
  <div
    {...props}
    className={classNames(
      'bg-white bg-opacity-100 dark:bg-actually-black dark:bg-opacity-10',
      props.className
    )}
  />
)
