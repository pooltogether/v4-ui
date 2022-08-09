import classNames from 'classnames'
import { DetailedHTMLProps, LabelHTMLAttributes } from 'react'

export const Label: React.FC<
  DetailedHTMLProps<LabelHTMLAttributes<HTMLLabelElement>, HTMLLabelElement>
> = (props) => (
  <label {...props} className={classNames(props.className, 'text-xxs font-bold opacity-50')} />
)
