import React, { useState } from 'react'
import classnames from 'classnames'
import FeatherIcon from 'feather-icons-react'
import {
  Menu,
  MenuList,
  MenuButton,
  MenuItem,
} from '@reach/menu-button'

export function DropdownList(props) {
  const {
    id,
    className,
    current,
    formatValue,
    hoverTextColor,
    label,
    textColor,
    values,
    onValueSet
  } = props

  const [currentValue, setCurrentValue] = useState(current ? current : '')

  const handleChangeValueClick = (newValue) => {
    if (current !== null) {
      setCurrentValue(newValue)
    }
    onValueSet(newValue)
  }

  let valuesArray = []
  if (typeof values === 'object') {
    valuesArray = Object.keys(values).map(v => v)
  }

  const menuItems = valuesArray.map(valueItem => {
    let value = valueItem

    const selected = value === currentValue

    return <MenuItem
      key={`${id}-value-picker-item-${value}`}
      onSelect={() => { handleChangeValueClick(value) }}
      className={classnames(
        {
          selected
        }
      )}
    >
      {formatValue ? formatValue(value) : value}
    </MenuItem>
  })

  const inactiveTextColorClasses = `${textColor} hover:${hoverTextColor}`
  const activeTextColorClasses = `${hoverTextColor} hover:${hoverTextColor}`

  return <>
    <Menu>
      {({ isExpanded }) => (
        <>
          <MenuButton
            className={classnames(
              className,
              'inline-flex items-center justify-center trans font-bold',
              {
                [inactiveTextColorClasses]: !isExpanded,
                [activeTextColorClasses]: isExpanded,
              }
            )}
          >
            {label ? label : currentValue} <FeatherIcon
              icon={isExpanded ? 'chevron-up' : 'chevron-down'}
              className='relative w-4 h-4 inline-block ml-2'
              strokeWidth='0.15rem'
            />
          </MenuButton>

          <MenuList className='slide-down'>
            {menuItems}
          </MenuList>
        </>
      )}
    </Menu>

  </>
}