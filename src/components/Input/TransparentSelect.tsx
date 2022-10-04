import classNames from 'classnames'
import { DetailedHTMLProps, SelectHTMLAttributes } from 'react'

export const TransparentSelect = (
  props: DetailedHTMLProps<SelectHTMLAttributes<HTMLSelectElement>, HTMLSelectElement> & {
    paddingClassName?: string
  }
) => (
  <select
    {...props}
    className={classNames(
      'appearance-none inline font-bold bg-white bg-opacity-100 hover:bg-opacity-50 dark:bg-actually-black dark:bg-opacity-10 dark:hover:bg-opacity-5 cursor-pointer transition rounded-full leading-none  focus:ring-2 focus:ring-pt-purple border-0 text-pt-purple-darkest dark:text-white',
      props.className,
      props.paddingClassName
    )}
  />
)

TransparentSelect.defaultProps = {
  paddingClassName: 'py-0.5 px-3'
}
