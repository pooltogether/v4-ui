import classNames from 'classnames'
import React from 'react'
import { DetailedHTMLProps, InputHTMLAttributes } from 'react'

export interface InputProps
  extends DetailedHTMLProps<InputHTMLAttributes<HTMLInputElement>, HTMLInputElement> {}

/**
 * A base level input component with minimal sizing classNames
 */
export const Input: React.FC<InputProps> = React.forwardRef((props, ref) => (
  <input
    {...props}
    ref={ref}
    className={classNames(
      props.className,
      'py-2 px-4 xs:py-3 xs:px-5 rounded-lg font-semibold xs:text-lg disabled:opacity-50'
    )}
  />
))
Input.displayName = 'Input'

/**
 * An input component with color classNames
 */
export const StyledInput: React.FC<InputProps & { invalid?: boolean }> = React.forwardRef(
  (props, ref) => {
    const { invalid, className, ...inputProps } = props
    return (
      <Input
        {...inputProps}
        ref={ref}
        className={classNames(
          className,
          'transition',
          'focus:outline-none focus:ring-2 focus:ring-pt-teal hover:ring-opacity-50',
          { 'ring-2 ring-pt-red-light': invalid }
        )}
      />
    )
  }
)
StyledInput.displayName = 'StyledInput'
