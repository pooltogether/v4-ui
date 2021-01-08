import React, { useState } from 'react'
import classnames from 'classnames'
import FeatherIcon from 'feather-icons-react'
import {
  Menu,
  MenuList,
  MenuPopover,
  MenuButton,
  MenuItem,
  MenuItems,
} from '@reach/menu-button'

export function DropdownGeneric(props) {
  const {
    children,
    className,
    hoverTextColor,
    label,
    textColor,
  } = props

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

          <MenuPopover>
            {children}
          </MenuPopover>

          {/* <MenuList className='slide-down'>
            {menuItems}
          </MenuList> */}
        </>
      )}
    </Menu>

  </>
}