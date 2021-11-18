import React, { useRef, useState } from 'react'
import classnames from 'classnames'

interface StaticPrizeVideoBackgroundProps {
  videoClip: VideoClip
  videoState: VideoState
  className?: string
}

const VIDEO_VERSION = 'v002'

enum VideoState {
  loop = 'LOOP',
  transition = 'IN'
}

enum VideoClip {
  noPrize = 'NOPRIZE',
  prize = 'PRIZE',
  rest = 'REST',
  reveal = 'REVEAL'
}

const getVideoSource = (videoClip: VideoClip, videoState: VideoState, extension: string) =>
  `/videos/PT_Loot_${videoClip}_${videoState}_${VIDEO_VERSION}.${extension}`

export const StaticPrizeVideoBackground = (props: StaticPrizeVideoBackgroundProps) => {
  const { className, videoClip, videoState } = props

  return (
    <div className={classnames(className, 'h-full w-full')}>
      <video playsInline autoPlay muted loop preload='auto'>
        <source src={getVideoSource(videoClip, videoState, 'webm')} type='video/webm' />
      </video>
    </div>
  )
}

StaticPrizeVideoBackground.defaultProps = {
  className: '',
  videoClip: VideoClip.rest,
  videoState: VideoState.loop
}
