import classNames from 'classnames'
import { ButtonHTMLAttributes, DetailedHTMLProps } from 'react'

export const AccentTextButton: React.FC<
  DetailedHTMLProps<ButtonHTMLAttributes<HTMLButtonElement>, HTMLButtonElement> & {
    sizeClassName?: string
  }
> = (props) => {
  const { sizeClassName, className, ...remainingProps } = props
  return (
    <button
      {...remainingProps}
      className={classNames(
        'text-gradient-magenta hover:opacity-70 trans font-bold text-left',
        sizeClassName,
        className
      )}
    />
  )
}

AccentTextButton.defaultProps = {
  sizeClassName: 'text-lg'
}
