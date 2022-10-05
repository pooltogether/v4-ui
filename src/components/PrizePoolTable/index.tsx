import { NetworkIcon, TokenIcon } from '@pooltogether/react-components'
import { getNetworkNiceNameByChainId } from '@pooltogether/utilities'
import { PrizePool } from '@pooltogether/v4-client-js'
import { getChainColorByChainId } from '@pooltogether/wallet-connection'
import classNames from 'classnames'
import FeatherIcon from 'feather-icons-react'
import React, { useMemo, useState } from 'react'

export const PrizePoolTable: React.FC<{
  data: {
    prizePool: PrizePool
    percentage?: number
    [key: string]: React.ReactNode
  }[]
  headers: {
    [key: string]: React.ReactNode
  }
  className?: string
}> = (props) => {
  const { data, headers, className } = props
  const columns = useMemo(() => Object.keys(headers).length + 1, [headers])

  return (
    <div className={classNames('', className)}>
      <div className={`ml-auto text-xxs opacity-80 grid grid-cols-${columns} text-center`}>
        <div className='' />
        {Object.values(headers).map((header, index) => (
          <div className='' key={`header-${index}`}>
            {header}
          </div>
        ))}
      </div>
      {data?.map((data) => (
        <PrizePoolRow
          key={'ppr-' + data.prizePool.id()}
          {...data}
          headers={headers}
          columns={columns}
        />
      ))}
    </div>
  )
}

const PrizePoolRow: React.FC<{
  [key: string]: React.ReactNode
  prizePool: PrizePool
  columns: number
  percentage?: number
  headers: {
    [key: string]: React.ReactNode
  }
}> = (props) => {
  const { prizePool, percentage, columns, headers, ...data } = props
  const [id] = useState(Math.random())

  return (
    <div className={classNames(`grid grid-cols-${columns} text-center`)}>
      <PrizePoolLabel prizePool={prizePool} percentage={percentage} />
      {Object.keys(headers).map((header, index) => (
        <div key={`row-item-${index}-${prizePool.id()}`}>{props[header]}</div>
      ))}
    </div>
  )
}

const PrizePoolLabel: React.FC<{ prizePool: PrizePool; percentage?: number }> = (props) => {
  const { prizePool, percentage } = props
  // const { data } = usePrizePoolTokens(prizePool)
  const [id] = useState(Math.random())

  return (
    <div className='flex items-center ml-3 xs:ml-10'>
      {/* {!!percentage && (
        <FeatherIcon
          icon={id > 0.5 ? 'triangle' : 'circle'}
          style={{
            color: getChainColorByChainId(prizePool.chainId),
            scale: `${Math.max(percentage + 0.2, 0.4)}`,
            rotate: `${id * 100}deg`
          }}
          className='fill-current mr-3'
        />
      )} */}
      {/* <TokenIcon
        chainId={prizePool.chainId}
        address={data?.token.address}
        sizeClassName='w-4 h-4'
        className='-mr-1'
      /> */}
      <NetworkIcon
        chainId={prizePool.chainId}
        sizeClassName='w-4 h-4'
        className='mr-2'
        style={
          percentage
            ? {
                scale: `${Math.min(percentage + 0.7, 1.5)}`
              }
            : undefined
        }
      />
      <span>{getNetworkNiceNameByChainId(prizePool.chainId)}</span>
    </div>
  )
}
