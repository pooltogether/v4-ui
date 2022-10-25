import classNames from 'classnames'
import { DetailedHTMLProps, SelectHTMLAttributes } from 'react'

export const TransparentSelect = (
  props: DetailedHTMLProps<SelectHTMLAttributes<HTMLSelectElement>, HTMLSelectElement> & {
    paddingClassName?: string
  }
) => {
  const { className, paddingClassName, ...remainingProps } = props
  return (
    <select
      {...remainingProps}
      className={classNames(
        'appearance-none inline font-bold bg-white bg-opacity-100 hover:bg-opacity-50 dark:bg-actually-black dark:bg-opacity-25 dark:hover:bg-opacity-10 cursor-pointer transition rounded-full leading-none focus:ring-2 focus:ring-pt-purple border-0 text-pt-purple-darkest dark:text-white',
        className,
        paddingClassName
      )}
    />
  )
}

TransparentSelect.defaultProps = {
  paddingClassName: 'py-1 px-3'
}
