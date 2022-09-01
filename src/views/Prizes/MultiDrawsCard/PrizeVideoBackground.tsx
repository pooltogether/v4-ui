import React, { useCallback, useEffect, useRef, useState } from 'react'
import classnames from 'classnames'

import classNames from 'classnames'

const VIDEO_VERSION = 'v002'

export enum VideoState {
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
  `/videos/PT_Loot_${videoClip}_${videoState}_${VIDEO_VERSION}.${extension}?raw=true`

export const PrizeVideoBackground: React.FC<{
  targetVideoClip?: VideoClip
  initialVideoClip?: VideoClip
  initialVideoState?: VideoState
  startWithTarget?: boolean
  className?: string
  onTargetReached?: () => void
}> = (props) => {
  const {
    className,
    startWithTarget,
    targetVideoClip,
    initialVideoClip,
    initialVideoState,
    onTargetReached
  } = props
  const [isVideoAllowed, setIsVideoAllowed] = useState(true)

  const [activeVideoClip, setActiveVideoClip] = useState<VideoClip>(
    startWithTarget ? targetVideoClip : initialVideoClip
  )
  const [activeVideoState, setActiveVideoState] = useState<VideoState>(
    startWithTarget ? VideoState.loop : initialVideoState
  )

  const restLoop = useRef<HTMLVideoElement>(null)
  const revealTransitionIn = useRef<HTMLVideoElement>(null)
  const revealLoop = useRef<HTMLVideoElement>(null)
  const noPrizeTransitionIn = useRef<HTMLVideoElement>(null)
  const noPrizeLoop = useRef<HTMLVideoElement>(null)
  const prizeTransitionIn = useRef<HTMLVideoElement>(null)
  const prizeLoop = useRef<HTMLVideoElement>(null)

  useEffect(() => {
    if (activeVideoClip === targetVideoClip && activeVideoState === VideoState.transition) {
      onTargetReached?.()
    }
  }, [targetVideoClip, activeVideoClip, activeVideoState])

  const getRef = (videoClip: VideoClip, videoState: VideoState) => {
    if (videoClip === VideoClip.rest && videoState === VideoState.loop) {
      return restLoop
    } else if (videoClip === VideoClip.reveal && videoState === VideoState.transition) {
      return revealTransitionIn
    } else if (videoClip === VideoClip.reveal && videoState === VideoState.loop) {
      return revealLoop
    } else if (videoClip === VideoClip.noPrize && videoState === VideoState.transition) {
      return noPrizeTransitionIn
    } else if (videoClip === VideoClip.noPrize && videoState === VideoState.loop) {
      return noPrizeLoop
    } else if (videoClip === VideoClip.prize && videoState === VideoState.transition) {
      return prizeTransitionIn
    } else if (videoClip === VideoClip.prize && videoState === VideoState.loop) {
      return prizeLoop
    }
    return null
  }

  const updateAndPlayVideo = (videoClip: VideoClip, videoState: VideoState) => {
    const ref = getRef(videoClip, videoState)
    setActiveVideoClip(videoClip)
    setActiveVideoState(videoState)
    ref.current.play()
  }

  const playNext = useCallback(
    (videoClip: VideoClip, videoState: VideoState) => {
      if (videoState === VideoState.transition) {
        updateAndPlayVideo(videoClip, VideoState.loop)
      } else {
        if (videoClip === VideoClip.rest) {
          updateAndPlayVideo(VideoClip.reveal, VideoState.transition)
        } else if (videoClip === VideoClip.reveal) {
          updateAndPlayVideo(targetVideoClip, VideoState.transition)
        } else {
          updateAndPlayVideo(videoClip, videoState)
        }
      }
    },
    [targetVideoClip]
  )

  const onEnded = useCallback(
    (videoClip: VideoClip, videoState: VideoState) => {
      if (targetVideoClip !== videoClip || videoState !== VideoState.loop) {
        playNext(videoClip, videoState)
      } else {
        getRef(videoClip, videoState).current.play()
      }
    },
    [activeVideoClip, activeVideoState, targetVideoClip]
  )

  if (!isVideoAllowed) {
    return (
      <PrizePictureBackgroud
        className={className}
        videoClip={targetVideoClip}
        onTargetReached={onTargetReached}
      />
    )
  }

  return (
    <div className={classnames(className, 'h-full w-full relative')}>
      {/* Fallback image while loading so there isn't a flicker */}
      {/* <img src={'/prize-images/REST.png'} className='absolute inset-0 z-1' /> */}
      {/* Rest */}
      {/* Rest Loop */}
      <VideoWrapper
        setIsVideoAllowed={setIsVideoAllowed}
        videoClip={VideoClip.rest}
        videoState={VideoState.loop}
        ref={getRef(VideoClip.rest, VideoState.loop)}
        activeVideoClip={activeVideoClip}
        activeVideoState={activeVideoState}
        onEnded={() => onEnded(VideoClip.rest, VideoState.loop)}
      />

      {/* Reveal */}
      {/* Reveal Transition In */}
      <VideoWrapper
        setIsVideoAllowed={setIsVideoAllowed}
        videoClip={VideoClip.reveal}
        videoState={VideoState.transition}
        ref={getRef(VideoClip.reveal, VideoState.transition)}
        activeVideoClip={activeVideoClip}
        activeVideoState={activeVideoState}
        onEnded={() => onEnded(VideoClip.reveal, VideoState.transition)}
      />
      {/* No Prize Loop */}
      <VideoWrapper
        setIsVideoAllowed={setIsVideoAllowed}
        videoClip={VideoClip.reveal}
        videoState={VideoState.loop}
        ref={getRef(VideoClip.reveal, VideoState.loop)}
        activeVideoClip={activeVideoClip}
        activeVideoState={activeVideoState}
        onEnded={() => onEnded(VideoClip.reveal, VideoState.loop)}
      />

      {/* No Prize */}
      {/* No Prize Transition */}
      <VideoWrapper
        setIsVideoAllowed={setIsVideoAllowed}
        videoClip={VideoClip.noPrize}
        videoState={VideoState.transition}
        ref={getRef(VideoClip.noPrize, VideoState.transition)}
        activeVideoClip={activeVideoClip}
        activeVideoState={activeVideoState}
        onEnded={() => onEnded(VideoClip.noPrize, VideoState.transition)}
      />
      {/* No Prize Loop */}
      <VideoWrapper
        setIsVideoAllowed={setIsVideoAllowed}
        videoClip={VideoClip.noPrize}
        videoState={VideoState.loop}
        ref={getRef(VideoClip.noPrize, VideoState.loop)}
        activeVideoClip={activeVideoClip}
        activeVideoState={activeVideoState}
        onEnded={() => onEnded(VideoClip.noPrize, VideoState.loop)}
      />

      {/* Prize */}
      {/* Prize Transition */}
      <VideoWrapper
        setIsVideoAllowed={setIsVideoAllowed}
        videoClip={VideoClip.prize}
        videoState={VideoState.transition}
        ref={getRef(VideoClip.prize, VideoState.transition)}
        activeVideoClip={activeVideoClip}
        activeVideoState={activeVideoState}
        onEnded={() => onEnded(VideoClip.prize, VideoState.transition)}
      />
      {/* Prize Loop */}
      <VideoWrapper
        setIsVideoAllowed={setIsVideoAllowed}
        videoClip={VideoClip.prize}
        videoState={VideoState.loop}
        ref={getRef(VideoClip.prize, VideoState.loop)}
        activeVideoClip={activeVideoClip}
        activeVideoState={activeVideoState}
        onEnded={() => onEnded(VideoClip.prize, VideoState.loop)}
      />
    </div>
  )
}

PrizeVideoBackground.defaultProps = {
  initialVideoClip: VideoClip.rest,
  initialVideoState: VideoState.loop,
  targetVideoClip: VideoClip.rest
}

const VideoWrapper = React.forwardRef<
  HTMLVideoElement,
  {
    videoClip: VideoClip
    videoState: VideoState
    activeVideoClip: VideoClip
    activeVideoState: VideoState
    setIsVideoAllowed: (isVideoAllowed: boolean) => void
    onEnded: () => void
    className?: string
  }
>((props, ref) => {
  const {
    videoClip,
    videoState,
    activeVideoClip,
    activeVideoState,
    className,
    setIsVideoAllowed,
    onEnded
  } = props

  const isActive = videoClip === activeVideoClip && videoState === activeVideoState

  useEffect(() => {
    if (videoClip === VideoClip.rest && videoState === VideoState.loop) {
      const promise = ref.current.play()
      if (promise !== undefined) {
        promise.catch((e) => {
          console.error(e)
          setIsVideoAllowed(false)
        })
      }
    }
  }, [])

  return (
    <video
      className={classNames(className, 'absolute inset-0', {
        'z-1': isActive,
        'z-0': !isActive
      })}
      ref={ref}
      playsInline
      muted
      onEnded={() => {
        onEnded()
      }}
    >
      <source src={getVideoSource(props.videoClip, props.videoState, 'webm')} type='video/webm' />
      <source
        src={getVideoSource(props.videoClip, props.videoState, 'original.mp4')}
        type='video/mp4'
      />
    </video>
  )
})
VideoWrapper.displayName = 'VideoWrapper'

export const PrizePictureBackgroud: React.FC<{
  videoClip?: VideoClip
  className?: string
  onTargetReached?: () => void
}> = (props) => {
  const { videoClip, onTargetReached, className } = props

  const getImageSource = (videoClip: VideoClip) => `/prize-images/${videoClip}.png`

  useEffect(() => {
    onTargetReached?.()
  }, [videoClip])

  return (
    <div className={classnames(className, 'h-full w-full relative')}>
      <img src={getImageSource(videoClip)} className={'absolute inset-0'} />
    </div>
  )
}

PrizePictureBackgroud.defaultProps = {
  videoClip: VideoClip.rest
}
