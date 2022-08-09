import classNames from 'classnames'
import { useEffect, useRef, useState } from 'react'

const Test = () => {
  const a1 = useRef<HTMLVideoElement>(null)
  const a2 = useRef<HTMLVideoElement>(null)

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

  useEffect(() => {
    'Mount play'
    const promise = a1.current.play()
    a2.current.load()
    if (promise !== undefined) {
      promise.then((a) => console.log('m then', a)).catch((e) => console.error('m catch', e))
    }
  }, [])

  const [vidState, setVidState] = useState(true)

  return (
    <div>
      <button
        onClick={() => {
          setVidState(!vidState)
          const promise = a1.current.play()
          if (promise !== undefined) {
            promise.then((a) => console.log('then', a)).catch((e) => console.error('catch', e))
          }
        }}
      >
        play
      </button>
      <div className='relative'>
        <video
          className={classNames('border absolute inset-0', {
            'z-10': vidState,
            'z-0': !vidState
          })}
          ref={a1}
          playsInline
          muted
          preload='auto'
          onLoadStart={() => {
            console.log('onLoadStart')
          }}
          onEnded={() => {
            setVidState(!vidState)
            a2.current
              .play()
              .then((a) => console.log('a2 then', a))
              .catch((e) => console.error('a2 catch', e))
            console.log('onEnded')
          }}
        >
          <source src={getVideoSource(VideoClip.rest, VideoState.loop, 'webm')} type='video/webm' />
          <source
            src={getVideoSource(VideoClip.rest, VideoState.loop, 'original.mp4')}
            type='video/mp4'
          />
        </video>
        <video
          className={classNames(
            // 'border absolute top-4 -bottom-4 left-4 -right-4',
            'border absolute inset-0',
            {
              'z-0': vidState,
              'z-10': !vidState
            }
          )}
          ref={a2}
          playsInline
          muted
          loop
          preload='auto'
          onLoadStart={() => {
            console.log('onLoadStart 2')
          }}
          onEnded={() => {
            console.log('onEnded 2')
          }}
        >
          <source
            src={getVideoSource(VideoClip.prize, VideoState.loop, 'webm')}
            type='video/webm'
          />
          <source
            src={getVideoSource(VideoClip.prize, VideoState.loop, 'original.mp4')}
            type='video/mp4'
          />
        </video>
      </div>
    </div>
  )
}

export default Test
