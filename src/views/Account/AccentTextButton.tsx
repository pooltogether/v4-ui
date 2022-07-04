import classNames from 'classnames'
import { ButtonHTMLAttributes, DetailedHTMLProps } from 'react'

export const AccentTextButton: React.FC<
  DetailedHTMLProps<ButtonHTMLAttributes<HTMLButtonElement>, HTMLButtonElement> & {
    sizeClassName?: string
  }
> = (props) => (
  <button
    {...props}
    className={classNames(
      'text-gradient-magenta hover:opacity-70 trans font-bold text-left',
      props.sizeClassName,
      props.className
    )}
  />
)

AccentTextButton.defaultProps = {
  sizeClassName: 'text-lg'
}
