import { BigNumber } from '@ethersproject/bignumber'
import classnames from 'classnames'
import { ClaimSectionState } from 'lib/views/Prizes/DrawCard'
import {
  DetailedHTMLProps,
  HTMLAttributes,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState
} from 'react'

interface PrizeAnimationProps
  extends DetailedHTMLProps<HTMLAttributes<HTMLDivElement>, HTMLDivElement> {
  claimSectionState: ClaimSectionState
  totalPrizeValueUnformatted: BigNumber
}

const VIDEO_VERSION = 'v001'

enum VideoState {
  loop = 'LOOP',
  in = 'IN'
}

enum LootVideo {
  noPrize = 'NOPRIZE',
  prize = 'PRIZE',
  rest = 'REST',
  reveal = 'REVEAL'
}

const getVideoSource = (video: LootVideo, videoState: VideoState) =>
  `/videos/PT_LOOT_${video}_${videoState}_${VIDEO_VERSION}.mp4`

export const PrizeAnimation = (props: PrizeAnimationProps) => {
  const { claimSectionState, totalPrizeValueUnformatted, className, ...containerProps } = props

  const inVideoPlayer = useRef<HTMLVideoElement>(null)
  const loopVideoPlayer = useRef<HTMLVideoElement>(null)

  const [currentVideo, setCurrentVideo] = useState<LootVideo>(LootVideo.rest)
  const [currentVideoState, setCurrentVideoState] = useState<VideoState>(VideoState.in)

  // TODO: Account for theme & transitioning between themes
  const videoToTransitionTo = useMemo(() => {
    switch (claimSectionState) {
      case ClaimSectionState.unchecked: {
        return LootVideo.rest
      }
      case ClaimSectionState.checking: {
        return LootVideo.reveal
      }
      case ClaimSectionState.unclaimed:
      case ClaimSectionState.claimed: {
        if (totalPrizeValueUnformatted.isZero()) {
          return LootVideo.noPrize
        }
        return LootVideo.prize
      }
    }
  }, [claimSectionState, totalPrizeValueUnformatted])

  const onLoopEnd = useCallback(() => {
    if (currentVideo !== videoToTransitionTo && currentVideoState === VideoState.loop) {
      // Video state has changed, set new video and transition in
      setCurrentVideoState(VideoState.in)
      setCurrentVideo(videoToTransitionTo)

      inVideoPlayer.current.setAttribute('src', getVideoSource(videoToTransitionTo, VideoState.in))
      loopVideoPlayer.current.setAttribute(
        'src',
        getVideoSource(videoToTransitionTo, VideoState.loop)
      )
      inVideoPlayer.current.load()
      loopVideoPlayer.current.load()
      inVideoPlayer.current.play()
    } else {
      // Video loop ended, play loop again
      loopVideoPlayer.current.play()
    }
  }, [currentVideo, currentVideoState, videoToTransitionTo])

  const onInEnd = () => {
    setCurrentVideoState(VideoState.loop)
    loopVideoPlayer.current.play()
  }

  return (
    <div className={classnames(className, 'overflow-hidden flex flex-col justify-end h-96')}>
      <video
        playsInline
        ref={inVideoPlayer}
        preload='auto'
        autoPlay
        muted
        onEnded={onInEnd}
        className={classnames({ hidden: currentVideoState !== VideoState.in })}
      >
        <source src={getVideoSource(LootVideo.rest, VideoState.in)} type='video/mp4' />
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
