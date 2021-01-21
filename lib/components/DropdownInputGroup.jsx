import React from 'react'
import classnames from 'classnames'
import FeatherIcon from 'feather-icons-react'
import { Menu, MenuList, MenuButton, MenuItem } from '@reach/menu-button'

import { DEFAULT_INPUT_CLASSES } from 'lib/constants'

export function DropdownInputGroup(props) {
  const { id, className, current, setCurrent, label, textColor, hoverTextColor, options } = props

  let optionsArray = []
  if (typeof options === 'object') {
    optionsArray = Object.keys(options).map((v) => v)
  }

  const currentValue = current ? current : optionsArray?.[0]

  const handleChange = (newValue) => {
    setCurrent(newValue)
  }

  const menuItems = optionsArray.map((valueItem) => {
    let value = valueItem

    const selected = value === currentValue

    return (
      <MenuItem
        key={`${id}-value-picker-item-${value}`}
        onSelect={() => {
          handleChange(value)
        }}
        className={classnames({
          selected,
        })}
      >
        {options[value]}
      </MenuItem>
    )
  })

  const inactiveTextColorClasses = `${textColor} hover:${hoverTextColor}`
  const activeTextColorClasses = `${hoverTextColor} hover:${hoverTextColor}`

  return (
    <>
      <div id={id} className='fieldset mx-auto'>
        <div className='flex justify-between'>
          <label>{label}</label>
        </div>
        <Menu>
          {({ isExpanded }) => (
            <>
              <MenuButton
                className={classnames(
                  'text-xxs xs:text-sm sm:text-xl lg:text-2xl',
                  'mb-2 lg:mb-2',
                  'rounded-full',
                  'px-8 py-3',
                  'bg-input',
                  'border',
                  'font-bold',
                  DEFAULT_INPUT_CLASSES,
                  className,
                  {
                    [inactiveTextColorClasses]: !isExpanded,
                    [activeTextColorClasses]: isExpanded,
                  }
                )}
              >
                <span>{options[currentValue]}</span>{' '}
                <FeatherIcon
                  icon={isExpanded ? 'chevron-up' : 'chevron-down'}
                  className='relative w-4 h-4 inline-block ml-2'
                  strokeWidth='0.15rem'
                />
              </MenuButton>

              <MenuList className='slide-down'>{menuItems}</MenuList>
            </>
          )}
        </Menu>
      </div>
    </>
  )
}
