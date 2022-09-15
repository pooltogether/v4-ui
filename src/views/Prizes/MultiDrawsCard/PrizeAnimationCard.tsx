import { Card } from '@pooltogether/react-components'
import classNames from 'classnames'

import { PrizeVideoBackground, VideoClip } from './PrizeVideoBackground'

export const PrizeAnimationCard: React.FC<{
  children: React.ReactNode
  className?: string
  targetVideoClip?: VideoClip
  onTargetReached?: () => void
}> = (props) => {
  const { children, targetVideoClip, onTargetReached, className } = props
  return (
    <Card className={classNames('relative overflow-hidden z-1', className)} paddingClassName=''>
      <div className='absolute inset-0 z-2'>
        <div className='py-4 xs:py-8 px-4 xs:px-8 flex flex-col h-full'>{children}</div>
      </div>
      <PrizeVideoBackground
        className='maintain-aspect-ratio overflow-hidden rounded-xl'
        targetVideoClip={targetVideoClip}
        onTargetReached={onTargetReached}
      />
    </Card>
  )
}
