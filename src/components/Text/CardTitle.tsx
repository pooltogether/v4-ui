import { ThemedClipSpinner } from '@pooltogether/react-components'
import classNames from 'classnames'

interface CardTitleProps {
  title: React.ReactNode
  secondary?: React.ReactNode
  loading?: boolean
  className?: string
  titleClassName?: string
  secondaryClassName?: string
}

export const CardTitle = (props: CardTitleProps) => (
  <div className={classNames('flex space-x-2 items-center', props.className)}>
    <h5 className={props.titleClassName}>
      {props.title}
      {props.secondary && !props.loading && (
        <span className={classNames('opacity-50 font-light ml-2', props.secondaryClassName)}>
          {props.secondary}
        </span>
      )}
      {props.loading && <ThemedClipSpinner sizeClassName='w-3 h-3' className='ml-2 opacity-50' />}
    </h5>
  </div>
)
