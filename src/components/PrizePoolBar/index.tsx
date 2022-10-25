import { PrizePool } from '@pooltogether/v4-client-js'
import { getChainColorByChainId } from '@pooltogether/wallet-connection'
import classNames from 'classnames'

export const PrizePoolBar: React.FC<{
  data: {
    prizePool: PrizePool
    percentage: number
  }[]
  className?: string
  borderClassName?: string
  commonClassName?: string
}> = (props) => {
  const { data, className, borderClassName, commonClassName } = props

  if (!data || data.length === 0) {
    return (
      <div
        className={classNames(
          className,
          commonClassName,
          'bg-actually-black bg-opacity-10 dark:bg-white dark:bg-opacity-10 animate-pulse'
        )}
      />
    )
  }

  return (
    <div className={classNames(className, commonClassName)}>
      {data?.map(({ prizePool, percentage }) => (
        <div
          key={prizePool.id()}
          className={classNames(
            'bg-pt-teal text-xxs pl-2 first:border-l-0 last:border-r-0 border-l border-r',
            borderClassName
          )}
          style={{
            width: `${percentage * 100}%`,
            background: getChainColorByChainId(prizePool.chainId)
          }}
        />
      ))}
    </div>
  )
}
PrizePoolBar.defaultProps = {
  borderClassName: 'border-pt-purple-bright',
  commonClassName: 'h-2 w-full rounded-full flex overflow-hidden'
}
