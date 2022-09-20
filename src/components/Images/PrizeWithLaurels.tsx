import { DetailedHTMLProps, ImgHTMLAttributes } from 'react'

export const PrizeWLaurels = (
  props: DetailedHTMLProps<ImgHTMLAttributes<HTMLImageElement>, HTMLImageElement>
) => {
  const { className, ...imageProps } = props
  return (
    <div className={className}>
      <img {...imageProps} />
    </div>
  )
}

PrizeWLaurels.defaultProps = {
  src: '/prize-w-laurels.svg',
  alt: 'Trophy icon',
  width: '88',
  height: '64'
}
