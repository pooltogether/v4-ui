import Image, { ImageProps } from 'next/image'
import ClipBoardWithCheckMarkSvg from '../../../assets/images/icon-clipboard-check.svg'

export const ClipBoardWithCheckMark = (props: ImageProps) => {
  const { className, ...imageProps } = props
  return (
    <div className={className}>
      <Image {...imageProps} />
    </div>
  )
}

ClipBoardWithCheckMark.defaultProps = {
  src: ClipBoardWithCheckMarkSvg,
  alt: 'check mark icon',
  width: '64',
  height: '64'
}
