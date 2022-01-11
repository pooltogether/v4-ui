import classNames from 'classnames'

interface CardTitleProps {
  title: string
  secondary?: string
  className?: string
  titleClassName?: string
  secondaryClassName?: string
}

export const CardTitle = (props: CardTitleProps) => (
  <div className={classNames('mb-2 flex space-x-2 items-center', props.className)}>
    <h5 className={props.titleClassName}>
      {props.title}
      {props.secondary && (
        <span className={classNames('opacity-50 font-light ml-2', props.secondaryClassName)}>
          {props.secondary}
        </span>
      )}
    </h5>
  </div>
)
