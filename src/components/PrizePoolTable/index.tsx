import { NetworkIcon } from '@pooltogether/react-components'
import { getNetworkNiceNameByChainId } from '@pooltogether/utilities'
import { PrizePool } from '@pooltogether/v4-client-js'
import classNames from 'classnames'
import React, { useMemo, useState } from 'react'

const getColSpan = (columns: number, index: number) => {
  if (columns < 3 && index === 0) {
    return `col-span-2 xs:col-span-1`
  }
  return `col-span-1`
}

const getGridCols = (columns: number) => {
  if (columns >= 3) {
    return `grid-cols-${columns}`
  } else {
    return `grid-cols-3 xs:grid-cols-${columns}`
  }
}

export const PrizePoolTable = (props: {
  data: {
    prizePool: PrizePool
    percentage?: number
  }[]
  headers: {
    [key: string]: React.ReactNode
  }
  className?: string
}) => {
  const { data, headers, className } = props
  const columns = useMemo(() => Object.keys(headers).length + 1, [headers])

  return (
    <div className={classNames('', className)}>
      <div
        className={classNames(
          'ml-auto text-xxs opacity-80 grid text-center xs:mb-2',
          getGridCols(columns)
        )}
      >
        <div className='' />
        {Object.values(headers).map((header, index) => (
          <div className={getColSpan(columns, index)} key={`header-${index}`}>
            {header}
          </div>
        ))}
      </div>
      <ul className='space-y-0 sm:space-y-0.5'>
        {data?.map((data) => (
          <PrizePoolRow
            key={'ppr-' + data.prizePool.id()}
            {...data}
            headers={headers}
            columns={columns}
          />
        ))}
      </ul>
    </div>
  )
}

const PrizePoolRow: React.FC<{
  prizePool: PrizePool
  columns: number
  percentage?: number
  headers: {
    [key: string]: React.ReactNode
  }
}> = (props) => {
  const { prizePool, percentage, columns, headers } = props

  return (
    <li className={classNames('grid', getGridCols(columns))}>
      <PrizePoolLabel prizePool={prizePool} percentage={percentage} />
      {Object.keys(headers).map((header, index) => (
        <div
          key={`row-item-${index}-${prizePool.id()}`}
          className={classNames(getColSpan(columns, index), 'text-center')}
        >
          {props[header]}
        </div>
      ))}
    </li>
  )
}

const PrizePoolLabel: React.FC<{ prizePool: PrizePool; percentage?: number }> = (props) => {
  const { prizePool } = props

  return (
    <div className='flex items-center ml-3 xs:ml-10 justify-start'>
      <NetworkIcon
        chainId={prizePool.chainId}
        sizeClassName='w-4 h-4 sm:w-5 sm:h-5'
        className='mr-2'
      />
      <span>{getNetworkNiceNameByChainId(prizePool.chainId)}</span>
    </div>
  )
}
