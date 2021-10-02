import { BigNumber } from '@ethersproject/bignumber'
import classnames from 'classnames'
import { ClaimState } from 'lib/views/Prizes/DrawCard'
import { useCallback, useEffect, useRef, useState } from 'react'

interface PrizeAnimationProps {
  className?: string
  claimState: ClaimState
  totalPrizeValueUnformatted: BigNumber
}

const VIDEO_VERSION = 'v001'

enum VideoState {
  loop = 'LOOP',
  transition = 'IN'
}

enum LootVideo {
  noPrize = 'NOPRIZE',
  prize = 'PRIZE',
  rest = 'REST',
  reveal = 'REVEAL'
}

const getVideoSource = (video: LootVideo, videoState: VideoState) =>
  `/videos/PT_Loot_${video}_${videoState}_${VIDEO_VERSION}.mp4`

export const PrizeAnimation = (props: PrizeAnimationProps) => {
  const { claimState, totalPrizeValueUnformatted, className } = props

  const transitionVideoPlayer = useRef<HTMLVideoElement>(null)
  const loopVideoPlayer = useRef<HTMLVideoElement>(null)

  const [videoQueue, setVideoQueue] = useState<LootVideo[]>([LootVideo.rest])
  // const currentVideo = videoQueue[0]
  const pushToVideoQueue = (video: LootVideo) => setVideoQueue((queue) => [...queue, video])
  const shiftFromVideoQueue = useCallback(() => {
    const newQueue = [...videoQueue]
    const video = newQueue.shift()
    setVideoQueue(newQueue)
    return video
  }, [videoQueue])

  const [currentVideoState, setCurrentVideoState] = useState<VideoState>(VideoState.transition)

  // Add to video queue on state change
  useEffect(() => {
    if (claimState === ClaimState.checking) {
      pushToVideoQueue(LootVideo.reveal)
    } else if (claimState === ClaimState.unclaimed || claimState === ClaimState.claimed) {
      if (totalPrizeValueUnformatted.isZero()) {
        pushToVideoQueue(LootVideo.noPrize)
      } else {
        pushToVideoQueue(LootVideo.prize)
      }
    }
  }, [claimState])

  const onLoopEnd = useCallback(() => {
    const videoToTransitionTo = shiftFromVideoQueue()
    if (
      videoToTransitionTo &&
      // currentVideo !== videoToTransitionTo &&
      currentVideoState === VideoState.loop
    ) {
      // Video state has changed, set new video and transition in
      setCurrentVideoState(VideoState.transition)

      transitionVideoPlayer.current.setAttribute(
        'src',
        getVideoSource(videoToTransitionTo, VideoState.transition)
      )
      loopVideoPlayer.current.setAttribute(
        'src',
        getVideoSource(videoToTransitionTo, VideoState.loop)
      )
      transitionVideoPlayer.current.load()
      loopVideoPlayer.current.load()
      transitionVideoPlayer.current.play()
    } else {
      // Video loop ended, play loop again
      loopVideoPlayer.current.play()
    }
  }, [currentVideoState, videoQueue, setVideoQueue])

  const onTransitionEnd = () => {
    setCurrentVideoState(VideoState.loop)
    loopVideoPlayer.current.play()
  }

  return (
    <div className={classnames(className, 'overflow-hidden flex flex-col justify-end sm:h-96')}>
      <video
        playsInline
        ref={transitionVideoPlayer}
        preload='auto'
        autoPlay
        muted
        onEnded={onTransitionEnd}
        className={classnames({ hidden: currentVideoState !== VideoState.transition })}
      >
        <source src={getVideoSource(LootVideo.rest, VideoState.transition)} type='video/mp4' />
      </video>
      <video
        playsInline
        ref={loopVideoPlayer}
        preload='auto'
        muted
        onEnded={onLoopEnd}
        className={classnames({ hidden: currentVideoState !== VideoState.loop })}
      >
        <source src={getVideoSource(LootVideo.rest, VideoState.loop)} type='video/mp4' />
      </video>
    </div>
  )
}
