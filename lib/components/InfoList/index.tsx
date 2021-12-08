import classnames from 'classnames'
import { DetailedHTMLProps, HTMLAttributes } from 'react'

interface InfoListProps
  extends DetailedHTMLProps<HTMLAttributes<HTMLUListElement>, HTMLUListElement> {
  bgClassName?: string
  textClassName?: string
}

export const ModalInfoList = (props: Omit<InfoListProps, 'bgClassName' & 'textClassName'>) => (
  <InfoList {...props} bgClassName='bg-pt-purple-lighter dark:bg-pt-purple' textClassName='' />
)

export const InfoList = (props: InfoListProps) => {
  const { className, bgClassName, textClassName, ...ulProps } = props
  return (
    <ul
      {...ulProps}
      className={classnames(
        className,
        bgClassName,
        textClassName,
        'w-full px-4 py-2 rounded-lg transition'
      )}
    />
  )
}

InfoList.defaultProps = {
  bgClassName: 'bg-tertiary',
  textClassName: 'text-accent-1'
}

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
