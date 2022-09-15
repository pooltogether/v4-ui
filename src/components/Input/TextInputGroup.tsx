import classnames from 'classnames'
import FeatherIcon from 'feather-icons-react'
import React from 'react'
import { useTranslation } from 'react-i18next'

import { RoundInput } from './TextInputs'
const DEFAULT_INPUT_LABEL_CLASS_NAME = 'text-xs'
const DEFAULT_INPUT_GROUP_CLASS_NAME = 'trans'

export const TextInputGroupType = Object.freeze({
  text: 'text',
  number: 'number'
})

export const TextInputGroup = (props) => {
  const {
    symbolAndIcon,
    // Input Props
    Input,
    id,
    label,
    rightLabel,
    disabled,
    readOnly,
    // Utilities
    isError,
    isSuccess,
    large,
    unit,
    unsignedNumber,
    unsignedWholeNumber,
    ...classAndInputProps
  } = props

  const { t } = useTranslation()

  let inputMode = 'text'
  let pattern = ''
  let patternForHookForm = {}
  if (unsignedNumber) {
    inputMode = 'decimal'
    pattern = '^[0-9]*[.,]?[0-9]*$'
    patternForHookForm = {
      value: /^\d*\.?\d*$/,
      message: t('pleaseEnterAPositiveNumber')
    }
  }

  let {
    containerTextClassName,
    containerRoundedClassName,
    containerMarginClassName,
    containerBorderClassName,
    containerBgClassName,
    containerClassName,
    labelClassName,
    rightLabelClassName,
    unitsClassName,
    ...inputProps
  } = classAndInputProps

  containerTextClassName = containerTextClassName
    ? containerTextClassName
    : classnames({
        'font-bold text-3xl': large,
        'text-xs': !large,
        'text-red-500': isError,
        'text-accent-1': disabled
      })

  containerRoundedClassName = containerRoundedClassName ? containerRoundedClassName : 'rounded-full'

  containerMarginClassName = containerMarginClassName ? containerMarginClassName : 'mb-2'

  containerBorderClassName = containerBorderClassName
    ? containerBorderClassName
    : classnames('border', {
        'border-red': isError,
        'border-green-2': isSuccess,
        'border-transparent': !isError && !isSuccess,
        'hover:border-accent-3 focus-within:border-accent-3 focus-within:shadow-green': !disabled
      })

  containerBgClassName = containerBgClassName
    ? containerBgClassName
    : classnames(containerBgClassName, {
        'bg-grey': disabled,
        'bg-card': readOnly
      })

  labelClassName = labelClassName
    ? labelClassName
    : classnames(DEFAULT_INPUT_LABEL_CLASS_NAME, {
        'cursor-not-allowed text-accent-2': disabled,
        'text-accent-1': !disabled
      })

  rightLabelClassName = rightLabelClassName
    ? rightLabelClassName
    : classnames(DEFAULT_INPUT_LABEL_CLASS_NAME, 'text-right', {
        'cursor-not-allowed text-accent-2': disabled,
        'text-accent-1': !disabled
      })

  unitsClassName = unitsClassName
    ? unitsClassName
    : classnames('font-bold text-xs whitespace-no-wrap', {
        'cursor-not-allowed font-whitesmoke': disabled,
        'font-white': !disabled
      })

  containerClassName = classnames(
    DEFAULT_INPUT_GROUP_CLASS_NAME,
    containerClassName,
    containerTextClassName,
    containerRoundedClassName,
    containerMarginClassName,
    containerBgClassName
  )

  let icon, iconColor
  if (isSuccess) {
    icon = 'check-circle'
    iconColor = 'stroke-current text-green-2'
  } else if (isError) {
    icon = 'slash'
    iconColor = 'stroke-current text-red'
  }

  const input = (
    <Input
      {...inputProps}
      inputMode={inputMode}
      id={id}
      disabled={disabled}
      readOnly={readOnly}
      pattern={pattern}
      patternForHookForm={patternForHookForm}
    />
  )

  return (
    <div className={containerClassName}>
      <div
        className={classnames('flex flex-row', {
          'justify-between': rightLabel && label,
          'justify-end': rightLabel && !label
        })}
      >
        {label && (
          <label htmlFor={id} className={labelClassName}>
            {label}
          </label>
        )}
        {rightLabel && <span className={rightLabelClassName}>{rightLabel}</span>}
      </div>
      <div className='flex justify-between'>
        {symbolAndIcon ? (
          <>
            <div className='relative w-full'>
              <div
                className={classnames(
                  'rounded-xl absolute font-semibold text-lg cursor-default z-10',
                  {
                    'text-accent-4': readOnly
                  }
                )}
                style={{ top: 18, left: 30, background: props.bgVarName }}
              >
                <span className={classnames({ '': readOnly })}>{symbolAndIcon}</span>
              </div>
              {input}
            </div>
          </>
        ) : (
          input
        )}

        {(unit || icon) && (
          <div className='pl-1'>
            {unit && <span className={unitsClassName}>{unit}</span>}
            {icon && <FeatherIcon icon={icon} className={classnames('w-4', iconColor)} />}
          </div>
        )}
      </div>
    </div>
  )
}

TextInputGroup.defaultProps = {
  Input: RoundInput,
  type: TextInputGroupType.text
}

export const RightLabelButton = (props) => {
  const { onClick, children } = props
  return (
    <button type='button' onClick={onClick} className='hover:text-accent-3 trans'>
      {children}
    </button>
  )
}
