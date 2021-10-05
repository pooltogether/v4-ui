import { BigNumber } from '@ethersproject/bignumber'
import classNames from 'classnames'
import classnames from 'classnames'
import { ClaimState } from 'lib/views/Prizes/DrawCard'
import { MutableRefObject, useCallback, useEffect, useRef, useState } from 'react'

interface PrizeAnimationProps {
  className?: string
  claimState: ClaimState
  totalPrizeValueUnformatted: BigNumber
  isDrawResultsFetched: boolean
  setCheckedAnimationFinished: () => void
}

const VIDEO_VERSION = 'v001'

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

interface Video {
  state: VideoState
  clip: VideoClip
}

const getVideoSource = (videoClip: VideoClip, videoState: VideoState) =>
  `/videos/PT_Loot_${videoClip}_${videoState}_${VIDEO_VERSION}.mp4`

export const PrizeAnimation = (props: PrizeAnimationProps) => {
  const {
    claimState,
    totalPrizeValueUnformatted,
    className,
    isDrawResultsFetched,
    setCheckedAnimationFinished
  } = props

  const a1 = useRef<HTMLVideoElement>(null)
  const a2 = useRef<HTMLVideoElement>(null)
  const b1 = useRef<HTMLVideoElement>(null)
  const b2 = useRef<HTMLVideoElement>(null)
  const c1 = useRef<HTMLVideoElement>(null)
  const c2 = useRef<HTMLVideoElement>(null)
  const d1 = useRef<HTMLVideoElement>(null)
  const d2 = useRef<HTMLVideoElement>(null)

  const [currentVideoClip, setCurrentVideoClip] = useState<VideoClip>(VideoClip.rest)
  const [currentVideoState, setCurrentVideoState] = useState<VideoState>(VideoState.transition)
  const [nextVideoClip, setNextVideoClip] = useState<VideoClip>(VideoClip.reveal)

  const isHidden = (videoClip: VideoClip, videoState: VideoState) => {
    if (videoClip !== currentVideoClip) return true
    if (videoState !== currentVideoState) return true
    return false
  }

  return (
    <div
      className={classnames(className, 'overflow-hidden flex flex-col justify-end h-80 xs:h-96')}
    >
      {/* Rest */}
      {/* Rest Transition */}
      <video
        className={classnames({ 'h-0': isHidden(VideoClip.rest, VideoState.transition) })}
        ref={a1}
        playsInline
        width={380}
        preload='auto'
        autoPlay
        muted
        onLoadStart={() => {
          a2.current.load()
        }}
        onEnded={() => {
          setCurrentVideoState(VideoState.loop)
          a2.current.play()
          b1.current.load()
        }}
      >
        <source src={getVideoSource(VideoClip.rest, VideoState.transition)} type='video/mp4' />
      </video>
      {/* Rest Loop */}
      <video
        className={classnames({ ' h-0': isHidden(VideoClip.rest, VideoState.loop) })}
        ref={a2}
        playsInline
        width={380}
        preload='auto'
        muted
        onEnded={() => {
          if (claimState === ClaimState.checking) {
            setCurrentVideoClip(VideoClip.reveal)
            setCurrentVideoState(VideoState.transition)
            b1.current.play()
            b2.current.load()
          } else {
            a2.current.play()
          }
        }}
      >
        <source src={getVideoSource(VideoClip.rest, VideoState.loop)} type='video/mp4' />
      </video>

      {/* Reveal */}
      {/* Reveal Transition */}
      <video
        className={classnames({
          ' h-0': isHidden(VideoClip.reveal, VideoState.transition)
        })}
        ref={b1}
        playsInline
        width={380}
        preload='auto'
        muted
        onLoadStart={() => {
          b2.current.load()
        }}
        onEnded={() => {
          setCurrentVideoState(VideoState.loop)
          b2.current.play()
          c1.current.load()
          d1.current.load()
        }}
      >
        <source src={getVideoSource(VideoClip.reveal, VideoState.transition)} type='video/mp4' />
      </video>
      {/* Reveal Loop */}
      <video
        className={classnames({ ' h-0': isHidden(VideoClip.reveal, VideoState.loop) })}
        ref={b2}
        playsInline
        width={380}
        preload='auto'
        muted
        onEnded={() => {
          if (claimState === ClaimState.checking && !isDrawResultsFetched) {
            b2.current.play()
          } else {
            setCurrentVideoClip(VideoClip.noPrize)
            setCurrentVideoState(VideoState.transition)
            c1.current.play()
            c2.current.load()
          }
        }}
      >
        <source src={getVideoSource(VideoClip.reveal, VideoState.loop)} type='video/mp4' />
      </video>

      {/* No Prize */}
      {/* No Prize Transition */}
      <video
        className={classnames({
          ' h-0': isHidden(VideoClip.noPrize, VideoState.transition)
        })}
        ref={c1}
        playsInline
        width={380}
        preload='auto'
        muted
        onPlay={() => setCheckedAnimationFinished()}
        onEnded={() => {
          setCurrentVideoState(VideoState.loop)
          c2.current.play()
        }}
      >
        <source src={getVideoSource(VideoClip.noPrize, VideoState.transition)} type='video/mp4' />
      </video>
      {/* No Prize Loop */}
      <video
        className={classnames({ ' h-0': isHidden(VideoClip.noPrize, VideoState.loop) })}
        ref={c2}
        playsInline
        width={380}
        preload='auto'
        muted
        onEnded={() => {
          c2.current.play()
        }}
      >
        <source src={getVideoSource(VideoClip.noPrize, VideoState.loop)} type='video/mp4' />
      </video>

      {/* Prize */}
      {/* Prize Transition */}
      <video
        className={classnames({
          ' h-0': isHidden(VideoClip.prize, VideoState.transition)
        })}
        ref={d1}
        playsInline
        width={380}
        preload='auto'
        muted
        onPlay={() => setCheckedAnimationFinished()}
        onEnded={() => {
          setCurrentVideoState(VideoState.loop)
          d2.current.play()
        }}
      >
        <source src={getVideoSource(VideoClip.prize, VideoState.transition)} type='video/mp4' />
      </video>
      {/* Prize Loop */}
      <video
        className={classnames({ ' h-0': isHidden(VideoClip.prize, VideoState.loop) })}
        ref={d2}
        playsInline
        width={380}
        preload='auto'
        muted
        onEnded={() => {
          d2.current.play()
        }}
      >
        <source src={getVideoSource(VideoClip.prize, VideoState.loop)} type='video/mp4' />
      </video>
    </div>
  )
}
