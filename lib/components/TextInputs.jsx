import React from 'react'
import classnames from 'classnames'
import { omit } from 'lodash'
import { isBrowser } from 'react-device-detect'

const DEFAULT_INPUT_CLASSES =
  'w-full py-2 px-5 trans outline-none focus:outline-none active:outline-none leading-none'

const sanitizeProps = (props) => {
  return omit(props, [
    'alignLeft',
    'label',
    'small',
    'large',
    'marginClasses',
    'paddingClasses',
    'borderClasses',
    'bgClasses',
    'inlineButton',
    'roundedClasses',
    'textClasses',
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
    DEFAULT_INPUT_CLASSES,
    props.marginClasses,
    props.paddingClasses,
    props.borderClasses,
    props.bgClasses,
    props.textClasses,
    props.roundedClasses,
    props.className,
    {
      'text-red': props.isError
    }
  )
}

export const SimpleInput = (props) => {
  const { autoFocus, value, ...inputProps } = props

  return (
    <input
      {...inputProps}
      autoFocus={autoFocus && isBrowser}
      value={value}
      className={DEFAULT_INPUT_CLASSES}
    />
  )
}

export const RoundInput = (props) => {
  let { autoFocus, pattern, required, register, validate } = props

  const className = collectClassNames(props)

  return (
    <input
      {...sanitizeProps(props)}
      autoFocus={autoFocus && isBrowser}
      ref={register({
        required,
        pattern,
        validate
      })}
      className={classnames(className, 'focus:outline-none')}
    />
  )
}

RoundInput.defaultProps = {
  marginClasses: '',
  paddingClasses: 'px-8 py-3',
  borderClasses: 'border border-accent-3',
  bgClasses: 'bg-input',
  textClasses: 'text-xs',
  roundedClasses: 'rounded-full'
}

export const TsunamiInput = (props) => {
  let { autoFocus, pattern, patternForHookForm, required, register, validate, readOnly } = props

  const className = collectClassNames(props)

  return (
    <input
      {...sanitizeProps(props)}
      autoFocus={autoFocus && isBrowser}
      ref={register({
        required,
        pattern: patternForHookForm,
        validate
      })}
      className={classnames(className, {
        'text-default opacity-50': readOnly
      })}
      style={{
        backgroundColor: readOnly ? 'rgba(173, 153, 216, 0.03)' : '',
        borderColor: readOnly ? 'rgba(173, 153, 216, 0.1)' : ''
      }}
    />
  )
}

TsunamiInput.defaultProps = {
  marginClasses: '',
  paddingClasses: 'px-8 py-4',
  borderClasses: 'border-2 border-primary hover:border-secondary focus:border-secondary',
  bgClasses: 'bg-transparent',
  textClasses: 'text-xl text-right',
  roundedClasses: 'rounded-lg',
  className: 'font-inter font-semibold'
}
