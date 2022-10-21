import classNames from 'classnames'
import FeatherIcon from 'feather-icons-react'
import { ButtonHTMLAttributes, DetailedHTMLProps } from 'react'

export const PrevArrow: React.FC<
  { arrowSizeClassName?: string } & DetailedHTMLProps<
    ButtonHTMLAttributes<HTMLButtonElement>,
    HTMLButtonElement
  >
> = (props) => <Arrow icon={'chevron-left'} iconClassName={'mr-auto'} {...props} />

export const NextArrow: React.FC<
  { arrowSizeClassName?: string } & DetailedHTMLProps<
    ButtonHTMLAttributes<HTMLButtonElement>,
    HTMLButtonElement
  >
> = (props) => <Arrow icon={'chevron-right'} iconClassName={'ml-auto'} {...props} />

export const Arrow: React.FC<
  { icon: string; iconClassName: string; arrowSizeClassName?: string } & DetailedHTMLProps<
    ButtonHTMLAttributes<HTMLButtonElement>,
    HTMLButtonElement
  >
> = (props) => {
  const { icon, iconClassName, arrowSizeClassName, className, ...buttonProps } = props
  return (
    <button {...buttonProps} type='button' className={classNames('z-1', className)}>
      <FeatherIcon className={classNames(arrowSizeClassName, iconClassName)} icon={icon} />
    </button>
  )
}

Arrow.defaultProps = {
  arrowSizeClassName: 'w-5 h-5'
}
