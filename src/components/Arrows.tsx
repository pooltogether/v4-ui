import classNames from 'classnames'
import FeatherIcon from 'feather-icons-react'
import { ButtonHTMLAttributes, DetailedHTMLProps } from 'react'

export const PrevArrow: React.FC<
  DetailedHTMLProps<ButtonHTMLAttributes<HTMLButtonElement>, HTMLButtonElement>
> = (props) => <Arrow icon={'chevron-left'} iconClassName={'mr-auto'} {...props} />

export const NextArrow: React.FC<
  DetailedHTMLProps<ButtonHTMLAttributes<HTMLButtonElement>, HTMLButtonElement>
> = (props) => <Arrow icon={'chevron-right'} iconClassName={'ml-auto'} {...props} />

export const Arrow: React.FC<
  { icon: string; iconClassName: string } & DetailedHTMLProps<
    ButtonHTMLAttributes<HTMLButtonElement>,
    HTMLButtonElement
  >
> = (props) => {
  const { icon, iconClassName, className, ...buttonProps } = props
  return (
    <button {...buttonProps} className={classNames('z-1', className)}>
      <FeatherIcon
        className={classNames('w-5 h-5 xs:w-6 xs:h-6 lg:w-8 lg:h-8  text-inverse', iconClassName)}
        icon={icon}
      />
    </button>
  )
}
