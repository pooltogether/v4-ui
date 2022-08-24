import classNames from 'classnames'
import { DetailedHTMLProps, SelectHTMLAttributes } from 'react'

export const TransparentSelect: React.FC<
  DetailedHTMLProps<SelectHTMLAttributes<HTMLSelectElement>, HTMLSelectElement>
> = (props) => (
  <select
    {...props}
    className={classNames(
      'appearance-none inline font-bold bg-actually-black bg-opacity-10 hover:bg-opacity-5 dark:bg-white dark:bg-opacity-10 dark:hover:bg-opacity-5 cursor-pointer transition rounded-full leading-none py-1 px-3 focus:ring-2 focus:ring-pt-purple border-0 text-pt-purple-darkest dark:text-white',
      props.className
    )}
  />
)
