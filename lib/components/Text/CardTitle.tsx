import classNames from 'classnames'

interface CardTitleProps {
  title: string
  secondary?: string
  className?: string
  titleClassName?: string
  secondaryClassName?: string
}

export const CardTitle = (props: CardTitleProps) => (
  <div className={classNames('flex space-x-2 items-center', props.className)}>
    <h3 className={props.titleClassName}>{props.title}</h3>
    {props.secondary && (
      <span
        className={classNames(
          'opacity-50 font-light text-base xs:text-xl',
          props.secondaryClassName
        )}
      >
        {props.secondary}
      </span>
    )}
  </div>
)
