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

  const videoPlayer = useRef<HTMLVideoElement>(null)

  const [currentVideo, setCurrentVideo] = useState<LootVideo>(LootVideo.rest)
  const [currentVideoState, setCurrentVideoState] = useState<VideoState>(VideoState.in)
  const [videoSource, setVideoSource] = useState<string>(
    getVideoSource(currentVideo, currentVideoState)
  )

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

  const onEnded = useCallback(() => {
    console.log('onEnded', currentVideo, currentVideoState, videoToTransitionTo, videoPlayer)
    // Video has transition in, set to loop
    if (currentVideoState === VideoState.in) {
      setCurrentVideoState(VideoState.loop)
      const videoSource = getVideoSource(currentVideo, VideoState.loop)
      setVideoSource(videoSource)
      videoPlayer.current.setAttribute('src', videoSource)
      videoPlayer.current.load()
    } else if (currentVideo !== videoToTransitionTo && currentVideoState === VideoState.loop) {
      // Video state has changed, set new video and transition in
      setCurrentVideoState(VideoState.in)
      setCurrentVideo(videoToTransitionTo)
      const videoSource = getVideoSource(videoToTransitionTo, VideoState.in)
      setVideoSource(videoSource)
      videoPlayer.current.setAttribute('src', videoSource)
      videoPlayer.current.load()
    } else {
      // Video ended, no changes, play loop again
      videoPlayer.current.play()
    }
  }, [currentVideo, currentVideoState, videoToTransitionTo])

  return (
    <div className={classnames(className, 'overflow-hidden flex flex-col justify-end h-96')}>
      <video ref={videoPlayer} preload='auto' autoPlay muted onEnded={onEnded}>
        <source src={videoSource} type='video/mp4' />
      </video>
    </div>
  )
}
