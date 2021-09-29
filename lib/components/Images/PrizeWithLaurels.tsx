import Image, { ImageProps } from 'next/image'
import PrizeWLaurelsPng from '../../../assets/images/prize-w-laurels@2x.png'

export const PrizeWLaurels = (props: ImageProps) => {
  const { className, ...imageProps } = props
  return (
    <div className={className}>
      <img {...imageProps} />
    </div>
  )
}

PrizeWLaurels.defaultProps = {
  src: PrizeWLaurelsPng,
  alt: 'Trophy icon',
  width: '88',
  height: '64'
}
