import { DrawResults } from '@pooltogether/v4-js-client'
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
  drawResults: DrawResults
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

const getVideoKey = (video: LootVideo, videoState: VideoState) => `${video}-${videoState}`
const getVideoSource = (video: LootVideo, videoState: VideoState) =>
  `/videos/PT_Loot_${video}_${videoState}_${VIDEO_VERSION}.mp4`
const getNextVideo = (video: LootVideo, videoState: VideoState, noPrize?: boolean) => {
  // After transition is loop
  if (videoState === VideoState.transition) {
    return { video, videoState: VideoState.loop }
  }

  // Otherwise it's the next video in the sequence
  if (video === LootVideo.rest) {
    return { video: LootVideo.reveal, videoState: VideoState.transition }
  } else if (video === LootVideo.reveal) {
    if (noPrize) {
      return { video: LootVideo.noPrize, videoState: VideoState.transition }
    }
    return { video: LootVideo.prize, videoState: VideoState.transition }
  }
}

export const PrizeAnimation = (props: PrizeAnimationProps) => {
  const { claimSectionState, className, drawResults, ...containerProps } = props

  const transitionVideoPlayer = useRef<HTMLVideoElement>(null)
  const loopVideoPlayer = useRef<HTMLVideoElement>(null)

  const [currentVideo, setCurrentVideo] = useState<LootVideo>(LootVideo.rest)
  const [currentVideoState, setCurrentVideoState] = useState<VideoState>(VideoState.transition)

  const [prefetchedVideos, setPrefetchedVideos] = useState<{ [key: string]: string }>({})

  const setVideo = useCallback(
    (video: LootVideo, videoState: VideoState) => {
      preloadNextVideo(video, videoState)

      const videoPlayer =
        videoState === VideoState.transition ? transitionVideoPlayer : loopVideoPlayer
      const videoSource = prefetchedVideos[getVideoKey(video, videoState)]
      videoPlayer.current.setAttribute('src', videoSource)
      videoPlayer.current.load()
      videoPlayer.current.play()
      setCurrentVideo(video)
      setCurrentVideoState(videoState)
    },
    [prefetchedVideos]
  )

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
        if (drawResults?.totalValue.isZero()) {
          return LootVideo.noPrize
        }
        return LootVideo.prize
      }
    }
  }, [claimSectionState, drawResults])

  const preloadNextVideo = async (video: LootVideo, videoState: VideoState) => {
    const nextVideo = getNextVideo(video, videoState)
    if (nextVideo) {
      const videoResponse = await fetch(getVideoSource(nextVideo.video, nextVideo.videoState))
      const videoBlob = await videoResponse.blob()
      const videoUrl = URL.createObjectURL(videoBlob)
      setPrefetchedVideos((prefetchedVideos) => {
        return {
          ...prefetchedVideos,
          [getVideoKey(nextVideo.video, nextVideo.videoState)]: videoUrl
        }
      })
    }
  }

  /**
   * Called when the loop video ends
   */
  const onLoopEnd = useCallback(() => {
    if (currentVideo !== videoToTransitionTo && currentVideoState === VideoState.loop) {
      setVideo(videoToTransitionTo, VideoState.transition)
    } else {
      // Video loop ended, no video to transition to, play loop again
      loopVideoPlayer.current.play()
    }
  }, [setVideo, currentVideo, currentVideoState, videoToTransitionTo])

  /**
   * Called when the transition video ends
   */
  const onTransitionEnd = useCallback(() => {
    setVideo(currentVideo, VideoState.loop)
  }, [currentVideo, setVideo])

  /**
   * Load the initial next video on mount
   */
  useEffect(() => {
    preloadNextVideo(currentVideo, currentVideoState)
  }, [])

  return (
    <div
      {...containerProps}
      className={classnames(className, 'overflow-hidden flex flex-col justify-end h-96')}
    >
      <video
        playsInline
        ref={transitionVideoPlayer}
        preload='auto'
        autoPlay
        muted
        onEnded={onTransitionEnd}
        className={classnames({ hidden: currentVideoState !== VideoState.transition })}
      >
        <source src={getVideoSource(currentVideo, VideoState.transition)} type='video/mp4' />
      </video>
      <video
        playsInline
        ref={loopVideoPlayer}
        preload='auto'
        muted
        onEnded={onLoopEnd}
        className={classnames({ hidden: currentVideoState !== VideoState.loop })}
      >
        <source src={getVideoSource(currentVideo, VideoState.loop)} type='video/mp4' />
      </video>
    </div>
  )
}
