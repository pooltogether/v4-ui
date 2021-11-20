import { DrawData } from 'lib/types/v4'
import { getTimestampStringWithTime } from 'lib/utils/getTimestampString'
import { sortDrawsByDrawIdAsc } from 'lib/utils/sortByDrawId'

export const MultipleDrawsDate = (props: {
  drawDatas: { [drawId: number]: DrawData }
  className?: string
}) => {
  const { drawDatas } = props
  const drawList = Object.values(drawDatas)
    .map((drawData) => drawData.draw)
    .sort(sortDrawsByDrawIdAsc)
  const firstDraw = drawList[0]
  const lastDraw = drawList[drawList.length - 1]

  if (drawList.length === 1) {
    return (
      <span className={props.className}>{getTimestampStringWithTime(firstDraw.timestamp)}</span>
    )
  }

  return (
    <span className={props.className}>
      {getTimestampStringWithTime(firstDraw.timestamp, {
        month: 'short',
        day: 'numeric'
      })}
      <span className='mx-1'>-</span>
      {getTimestampStringWithTime(lastDraw.timestamp, {
        month: 'short',
        day: 'numeric'
      })}
    </span>
  )
}

MultipleDrawsDate.defaultProps = {
  className: 'uppercase font-bold text-white opacity-70 text-xs leading-none'
}
