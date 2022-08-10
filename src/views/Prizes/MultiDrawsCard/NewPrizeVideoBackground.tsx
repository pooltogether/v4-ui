import React, { useCallback, useEffect, useRef, useState } from 'react'
import classnames from 'classnames'

import classNames from 'classnames'

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
  `/videos/PT_Loot_${videoClip}_${videoState}_${VIDEO_VERSION}.${extension}?raw=true`

export const NewPrizeVideoBackground: React.FC<{
  videoClip: VideoClip
  className?: string
  onEnded?: () => void
}> = (props) => {
  const { className, videoClip: targetVideoClip, onEnded: _onEnded } = props
  const [isVideoAllowed, setIsVideoAllowed] = useState(true)

  // Active video state
  const [activeVideoClip, setActiveVideoClip] = useState<VideoClip>(VideoClip.rest)
  const [activeVideoState, setActiveVideoState] = useState<VideoState>(VideoState.loop)

  const restLoop = useRef<HTMLVideoElement>(null)
  const revealTransitionIn = useRef<HTMLVideoElement>(null)
  const revealLoop = useRef<HTMLVideoElement>(null)
  const noPrizeTransitionIn = useRef<HTMLVideoElement>(null)
  const noPrizeLoop = useRef<HTMLVideoElement>(null)
  const prizeTransitionIn = useRef<HTMLVideoElement>(null)
  const prizeLoop = useRef<HTMLVideoElement>(null)

  useEffect(() => {
    console.log('State change - active', activeVideoClip, activeVideoState)
  }, [activeVideoClip, activeVideoState])

  useEffect(() => {
    console.log('State change - target', targetVideoClip)
  }, [targetVideoClip])

  // Load all videos
  // useEffect(() => {
  //   console.log('load all videos')
  //   restLoop.current?.load()
  //   revealTransitionIn.current?.load()
  //   revealLoop.current?.load()
  //   noPrizeTransitionIn.current?.load()
  //   noPrizeLoop.current?.load()
  //   prizeTransitionIn.current?.load()
  //   prizeLoop.current?.load()
  // }, [
  //   restLoop.current,
  //   revealTransitionIn.current,
  //   revealLoop.current,
  //   noPrizeTransitionIn.current,
  //   noPrizeLoop.current,
  //   prizeTransitionIn.current,
  //   prizeLoop.current
  // ])

  // Start playing the loop video
  // useEffect(() => {
  //   console.log('Start playing the loop video')
  //   const promise = restLoop.current?.play()
  //   if (promise !== undefined) {
  //     promise
  //       .then((a) => console.log('m then', a))
  //       .catch((e) => {
  //         setIsVideoAllowed(false)
  //       })
  //   }
  // }, [restLoop.current])

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

  const playVideo = (videoClip: VideoClip, videoState: VideoState) => {
    console.log('playVideo', videoClip, videoState)
    const ref = getRef(videoClip, videoState)
    setActiveVideoClip(videoClip)
    setActiveVideoState(videoState)
    ref.current.play()
  }

  const playNext = useCallback(
    (videoClip: VideoClip, videoState: VideoState) => {
      console.log('playNext', videoClip, videoState)
      if (videoState === VideoState.transition) {
        console.log('Transition ended - play loop', videoClip, videoState)
        playVideo(videoClip, VideoState.loop)
      } else {
        if (videoClip === VideoClip.rest) {
          console.log('Rest loop ended - play reveal', videoClip, videoState)
          playVideo(VideoClip.reveal, VideoState.transition)
        } else if (videoClip === VideoClip.reveal) {
          console.log(`Reveal loop ended - play target video - ${videoClip}`, videoClip, videoState)
          playVideo(targetVideoClip, VideoState.transition)
        } else {
          console.log('Loop ended - repeating', videoClip, videoState)
          playVideo(videoClip, videoState)
        }
      }
    },
    [targetVideoClip]
  )

  const onEnded = useCallback(
    (videoClip: VideoClip, videoState: VideoState) => {
      console.log('onEnded callback', videoClip, videoState, activeVideoClip, activeVideoState)
      if (targetVideoClip !== videoClip || videoState !== VideoState.loop) {
        console.log('Not at the target video clip, so play the next one', videoClip, videoState)
        playNext(videoClip, videoState)
      } else {
        console.log('At target video clip - loop', videoClip, videoState)
        playVideo(videoClip, videoState)
      }
      // _onEnded?.()
    },
    [activeVideoClip, activeVideoState, targetVideoClip]
  )

  if (!isVideoAllowed) {
    return <PrizePictureBackgroud videoClip={activeVideoClip} videoState={activeVideoState} />
  }

  return (
    <div className={classnames(className, 'h-full w-full relative')}>
      {/* Rest */}
      {/* Rest Loop */}
      <VideoWrapper
        setIsVideoAllowed={setIsVideoAllowed}
        videoClip={VideoClip.rest}
        videoState={VideoState.loop}
        ref={getRef(VideoClip.rest, VideoState.loop)}
        activeVideoClip={activeVideoClip}
        activeVideoState={activeVideoState}
        setActiveVideoState={setActiveVideoState}
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
        setActiveVideoState={setActiveVideoState}
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
        setActiveVideoState={setActiveVideoState}
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
        setActiveVideoState={setActiveVideoState}
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
        setActiveVideoState={setActiveVideoState}
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
        setActiveVideoState={setActiveVideoState}
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
        setActiveVideoState={setActiveVideoState}
        onEnded={() => onEnded(VideoClip.prize, VideoState.loop)}
      />
    </div>
  )
}

const VideoWrapper = React.forwardRef<
  HTMLVideoElement,
  {
    videoClip: VideoClip
    videoState: VideoState
    activeVideoClip: VideoClip
    activeVideoState: VideoState
    setActiveVideoState: (activeVideoState: VideoState) => void
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
    onEnded,
    setActiveVideoState
  } = props
  const isActive = videoClip === activeVideoClip && videoState === activeVideoState

  console.log('isActive', isActive, videoClip, videoState, activeVideoClip, activeVideoState)

  // Load all videos
  // useEffect(() => {
  //   ref.current.load()
  // }, [])

  useEffect(() => {
    console.log('VideoWrapper start playing rest loop', videoClip, videoState, ref)
    if (videoClip === VideoClip.rest && videoState === VideoState.loop) {
      const promise = ref.current.play()
      if (promise !== undefined) {
        promise
          .then((a) => console.log('m then', a))
          .catch((e) => {
            console.error(e)
            setIsVideoAllowed(false)
          })
      }
    }
  }, [])

  return (
    <video
      className={classNames(className, 'absolute inset-0', {
        'z-10': isActive,
        'z-0 hidden': !isActive
      })}
      ref={ref}
      playsInline
      muted
      onEnded={() => {
        console.log('onEnded', videoClip, videoState, onEnded)
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

const PrizePictureBackgroud: React.FC<{
  videoClip: VideoClip
  videoState: VideoState
  className?: string
}> = (props) => {
  const { videoClip, videoState, className } = props

  const getImageSource = (videoClip: VideoClip, videoState: VideoState) =>
    `/prize-images/${videoClip}_${videoState}.png`

  return (
    <img
      src={getImageSource(videoClip, videoState)}
      className={classNames(className, 'absolute inset-0')}
    />
  )
}
