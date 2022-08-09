import { useEffect, useRef } from 'react'

const Test = () => {
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
    const promise = a2.current.play()
    if (promise !== undefined) {
      promise.then((a) => console.log('m then', a)).catch((e) => console.error('m catch', e))
    }
  }, [])

  return (
    <div>
      <button
        onClick={() => {
          const promise = a2.current.play()
          if (promise !== undefined) {
            promise.then((a) => console.log('then', a)).catch((e) => console.error('catch', e))
          }
        }}
      >
        play
      </button>
      <video
        ref={a2}
        playsInline
        muted
        preload='auto'
        onLoadStart={() => {
          console.log('onLoadStart')
        }}
        onEnded={() => {
          console.log('onEnded')
        }}
      >
        <source src={getVideoSource(VideoClip.rest, VideoState.loop, 'webm')} type='video/webm' />
        <source
          src={getVideoSource(VideoClip.rest, VideoState.loop, 'original.mp4')}
          type='video/mp4'
        />
      </video>
    </div>
  )
}

export default Test
