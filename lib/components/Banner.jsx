import React from 'react'
import classnames from 'classnames'

export const BannerGradient = {
  purplePink: 'purplePink',
  rainbow: 'rainbow',
  rainbowBorder: 'rainbowBorder',
  purplePinkBorder: 'purplePinkBorder'
}

const BannerUnmemoized = (props) => {
  const { gradient, className, children, style, outerClassName, innerClassName } = props

  const bannerClass = 'p-4 sm:p-8 rounded-lg'

  if (gradient === BannerGradient.rainbow) {
    return (
      <div
        className={classnames(bannerClass, 'text-purple', className)}
        style={{
          ...style,
          backgroundImage: 'url("/BackgroundGradient.svg")',
          backgroundRepeat: 'no-repeat',
          backgroundSize: 'cover'
        }}
      >
        {children}
      </div>
    )
  } else if (gradient === BannerGradient.rainbowBorder) {
    return (
      <div
        className={classnames('text-inverse p-1 rounded-lg', outerClassName)}
        style={{
          backgroundImage: 'url("/BackgroundGradient.svg")',
          backgroundRepeat: 'no-repeat',
          backgroundSize: 'cover'
        }}
      >
        <div className={classnames(bannerClass, 'bg-body', innerClassName)} style={style}>
          {children}
        </div>
      </div>
    )
  } else if (gradient === BannerGradient.purplePinkBorder) {
    return (
      <div className={classnames('text-inverse p-1 rounded-lg pool-gradient-1', outerClassName)}>
        <div className={classnames(bannerClass, 'bg-body', innerClassName)} style={style}>
          {children}
        </div>
      </div>
    )
  }

  return (
    <div className={classnames(bannerClass, 'pool-gradient-1', className)} style={style}>
      {children}
    </div>
  )
}

BannerUnmemoized.defaultProps = {
  gradient: BannerGradient.purplePink
}

export const Banner = React.memo(BannerUnmemoized)
