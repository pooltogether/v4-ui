import classnames from 'classnames'

export const InfoList = (
  props: React.DetailedHTMLProps<React.HTMLAttributes<HTMLUListElement>, HTMLUListElement>
) => (
  <ul
    className={classnames('text-inverse rounded-lg py-4 px-4 bg-pt-purple-bright', props.className)}
  >
    {props.children}
  </ul>
)

interface InfoListItemProps {
  className?: string
  valueClassName?: string
  labelClassName?: string
  fontSizeClassName?: string
  label: React.ReactNode
  value: React.ReactNode
  dimValue?: boolean
}

export const InfoListItem = (props: InfoListItemProps) => {
  const { label, value, className, fontSizeClassName, dimValue, valueClassName, labelClassName } =
    props

  return (
    <li className={classnames('flex justify-between', className, fontSizeClassName)}>
      <span className={labelClassName}>{label}:</span>
      <span className={classnames('text-right', valueClassName, { 'opacity-80': dimValue })}>
        {value}
      </span>
    </li>
  )
}

InfoListItem.defaultProps = {
  fontSizeClassName: 'text-xxs xs:text-xs'
}
