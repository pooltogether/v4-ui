import React from 'react'
import classnames from 'classnames'
import { omit } from 'lodash'
import { isBrowser } from 'react-device-detect'

const DEFAULT_INPUT_CLASS_NAME =
  'w-full py-2 px-5 trans outline-none focus:outline-none active:outline-none leading-none'

const sanitizeProps = (props) => {
  return omit(props, [
    'alignLeft',
    'label',
    'small',
    'large',
    'marginClassName',
    'paddingClassName',
    'borderClassName',
    'bgClassName',
    'bgVarName',
    'inlineButton',
    'roundedClassName',
    'textClassName',
    'isError',
    'isLight',
    'register',
    'required', // required is consumed by the register func but we don't want it on the <input />
    'patternForHookForm',
    'tickerUpcased',
    'validate',
    'unsignedNumber',
    'unsignedWholeNumber',
    'rightLabel',
    'bottomRightLabel'
  ])
}

const collectClassNames = (props) => {
  return classnames(
    DEFAULT_INPUT_CLASS_NAME,
    props.marginClassName,
    props.paddingClassName,
    props.borderClassName,
    props.bgClassName,
    props.textClassName,
    props.roundedClassName,
    props.className,
    {
      'text-red': props.isError
    }
  )
}

export const SimpleInput = (props) => {
  const { id, autoFocus, value, register, patternForHookForm, required, validate, ...inputProps } =
    props

  return (
    <input
      {...inputProps}
      id={id}
      autoFocus={autoFocus && isBrowser}
      value={value}
      className={DEFAULT_INPUT_CLASS_NAME}
      {...register(id, {
        required,
        pattern: patternForHookForm,
        validate
      })}
    />
  )
}

export const RoundInput = (props) => {
  let { id, autoFocus, pattern, required, register, validate } = props

  const className = collectClassNames(props)

  return (
    <input
      {...sanitizeProps(props)}
      autoFocus={autoFocus && isBrowser}
      className={classnames(className, 'focus:outline-none')}
      {...register(id, {
        required,
        pattern,
        validate
      })}
    />
  )
}

RoundInput.defaultProps = {
  marginClassName: '',
  paddingClassName: 'px-8 py-3',
  borderClassName: 'border border-accent-3',
  bgClassName: 'bg-input',
  textClassName: 'text-xs',
  roundedClassName: 'rounded-full'
}

export const RectangularInput = (props) => {
  let { id, autoFocus, pattern, patternForHookForm, required, register, validate, readOnly } = props

  const className = collectClassNames(props)

  return (
    <input
      {...sanitizeProps(props)}
      autoFocus={autoFocus && isBrowser}
      className={classnames(className, {
        'text-accent-4': readOnly
      })}
      style={{
        backgroundColor: readOnly ? 'var(--color-bg-readonly-tsunami)' : '',
        borderColor: readOnly ? 'transparent' : ''
      }}
      {...register(id, {
        required,
        pattern: patternForHookForm,
        validate
      })}
    />
  )
}

RectangularInput.defaultProps = {
  marginClassName: '',
  paddingClassName: 'px-8 py-4',
  borderClassName: 'border-2 border-primary hover:border-secondary focus:border-secondary',
  bgClassName: 'bg-transparent',
  textClassName: 'text-xl text-right',
  roundedClassName: 'rounded-lg',
  className: 'font-inter font-semibold'
}
