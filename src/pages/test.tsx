import { NewPrizeVideoBackground } from '@views/Prizes/MultiDrawsCard/NewPrizeVideoBackground'
import { VideoClip } from '@views/Prizes/MultiDrawsCard/StaticPrizeVideoBackground'
import { useState } from 'react'

const Test = () => {
  const [videoClip, setVideoClip] = useState(VideoClip.rest)

  return (
    <>
      <button
        onClick={() => {
          setVideoClip(VideoClip.reveal)
        }}
      >
        Reveal
      </button>
      <button
        onClick={() => {
          setVideoClip(VideoClip.noPrize)
        }}
      >
        No Prize
      </button>
      <button
        onClick={() => {
          setVideoClip(VideoClip.prize)
        }}
      >
        Prize
      </button>
      <NewPrizeVideoBackground videoClip={videoClip} />
    </>
  )
}

export default Test
