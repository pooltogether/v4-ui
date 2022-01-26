import classNames from 'classnames'
import { loopXTimes } from 'lib/utils/loopXTimes'

export const LoadingList = (props: { listItems: number; className?: string }) => (
  <ul className={classNames('space-y-4', props.className)}>
    {loopXTimes(props.listItems, (i) => (
      <li
        key={`loading-list-${i}`}
        className='rounded-lg bg-white bg-opacity-20 dark:bg-actually-black dark:bg-opacity-10 animate-pulse w-full h-10'
      />
    ))}
  </ul>
)

LoadingList.defaultProps = {
  listItems: 3
}
