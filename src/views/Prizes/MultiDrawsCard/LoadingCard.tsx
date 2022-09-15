import { Card, ThemedClipSpinner } from '@pooltogether/react-components'
import classNames from 'classnames'
import { PrizePictureBackgroud } from './PrizeVideoBackground'

export const LoadingCard: React.FC<{ className?: string }> = (props) => (
  <Card className={classNames('relative overflow-hidden', props.className)} paddingClassName=''>
    <ThemedClipSpinner className='absolute left-4 xs:left-8 top-4 xs:top-8 z-3' />
    <PrizePictureBackgroud className='maintain-aspect-ratio' />
  </Card>
)
