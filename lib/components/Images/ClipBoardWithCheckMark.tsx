import Image, { ImageProps } from 'next/image'

export const ClipBoardWithCheckMark = (props: ImageProps) => {
  const { className, ...imageProps } = props
  return (
    <div className={className}>
      <img {...imageProps} />
    </div>
  )
}

ClipBoardWithCheckMark.defaultProps = {
  src: '../../../assets/images/icon-clipboard-check.svg',
  alt: 'check mark icon',
  width: '64',
  height: '64'
}
