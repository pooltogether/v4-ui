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

export enum VideoClip {
  noPrize = 'NOPRIZE',
  prize = 'PRIZE',
  rest = 'REST',
  reveal = 'REVEAL'
}

const getVideoSource = (videoClip: VideoClip, videoState: VideoState, extension: string) =>
  `https://github.com/pooltogether/v4-ui/blob/135321740cc3dafeac05c51f47b4c8a530afc036/public/videos/PT_Loot_${videoClip}_${videoState}_${VIDEO_VERSION}.${extension}?raw=true`

export const StaticPrizeVideoBackground = (props: StaticPrizeVideoBackgroundProps) => {
  const { className, videoClip, videoState } = props

  return (
    <div className={classnames(className, 'h-full w-full')}>
      <video playsInline autoPlay muted loop preload='auto' className='xs:rounded-xl rounded-t-xl'>
        <source src={getVideoSource(videoClip, videoState, 'webm')} type='video/webm' />
        <source src={getVideoSource(videoClip, videoState, 'original.mp4')} type='video/mp4' />
      </video>
    </div>
  )
}

StaticPrizeVideoBackground.defaultProps = {
  className: '',
  videoClip: VideoClip.rest,
  videoState: VideoState.loop
}
