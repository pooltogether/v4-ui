import { Draw } from '@pooltogether/v4-client-js'
import { getTimestampStringWithTime } from '@utils/getTimestampString'
import { sortDrawsByDrawIdAsc } from '@utils/sortByDrawId'
import classNames from 'classnames'

export const MultipleDrawsDate = (props: {
  partialDrawDatas: { [drawId: number]: { draw: Draw } }
  className?: string
  fontClassName?: string
}) => {
  const { partialDrawDatas, fontClassName, className } = props
  const drawList = Object.values(partialDrawDatas)
    .filter((drawData) => Boolean(drawData.draw))
    .map((drawData) => drawData.draw)
    .sort(sortDrawsByDrawIdAsc)
  const firstDraw = drawList[0]
  const lastDraw = drawList[drawList.length - 1]

  if (drawList.length === 0) {
    return null
  } else if (drawList.length === 1) {
    return (
      <span className={classNames(className, fontClassName)}>
        {getTimestampStringWithTime(
          firstDraw.beaconPeriodStartedAt.toNumber() + firstDraw.beaconPeriodSeconds
        )}
      </span>
    )
  }

  return (
    <span className={classNames(className, fontClassName)}>
      {getTimestampStringWithTime(
        firstDraw.beaconPeriodStartedAt.toNumber() + firstDraw.beaconPeriodSeconds,
        {
          month: 'short',
          day: 'numeric'
        }
      )}
      <span className='mx-1'>-</span>
      {getTimestampStringWithTime(
        lastDraw.beaconPeriodStartedAt.toNumber() + lastDraw.beaconPeriodSeconds,
        {
          month: 'short',
          day: 'numeric'
        }
      )}
    </span>
  )
}

MultipleDrawsDate.defaultProps = {
  className: 'uppercase font-bold text-xs leading-none',
  fontClassName: 'text-pt-purple-darkest text-opacity-90 dark:text-white dark:text-opacity-90'
}
