import React from 'react'
import classnames from 'classnames'

import { ProfileAvatar } from 'lib/components/ProfileAvatar'
import { ProfileName } from 'lib/components/ProfileName'

export function AccountButton(props) {
  const { openTransactions } = props

  return <>
    <button
      onClick={openTransactions}
      className='text-highlight-2 font-bold hover:text-inverse text-xs trans trans-fastest tracking-wider outline-none focus:outline-none active:outline-none z-20 h-8'
    >
      <div
        className={classnames(
          'flex items-center bg-default hover:bg-body rounded-full border border-highlight-2 px-2 xs:px-4 trans trans-fastest z-20 h-8',
        )}
      >
        <ProfileAvatar /> <span
          className='profile-name truncate flex items-center h-full'
        >
          <ProfileName />
        </span>
      </div>
    </button>
  </>
}
