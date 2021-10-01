import Image, { ImageProps } from 'next/image'

const ClipBoardWithCheckMarkSvg = (props) => {
  return (
    <svg
      {...props}
      height='100%'
      viewBox='0 0 64 80'
      fill='none'
      xmlns='http://www.w3.org/2000/svg'
      className='fill-current'
    >
      <path d='M56.412 9.206h-7.324V4.324a2.439 2.439 0 00-2.441-2.442H17.353a2.439 2.439 0 00-2.441 2.442v4.882H7.588c-4.038 0-7.323 3.286-7.323 7.323v56.148C.265 76.714 3.55 80 7.588 80h48.824c4.037 0 7.323-3.286 7.323-7.323V16.529c0-4.037-3.286-7.323-7.323-7.323zM19.794 6.765h24.412v7.323H19.794V6.765zm39.059 65.912a2.442 2.442 0 01-2.441 2.44H7.588a2.442 2.442 0 01-2.441-2.44V16.529a2.442 2.442 0 012.441-2.44h7.324v2.44a2.439 2.439 0 002.44 2.442h29.295a2.439 2.439 0 002.441-2.442v-2.44h7.324a2.442 2.442 0 012.44 2.44v56.148z' />
      <path d='M49.803 31.892L24.676 57.019l-8.039-8.039a2.438 2.438 0 00-3.451 0 2.439 2.439 0 000 3.452l9.764 9.765a2.438 2.438 0 003.452 0l26.853-26.853a2.438 2.438 0 000-3.452 2.438 2.438 0 00-3.452 0z' />
    </svg>
  )
}

export const ClipBoardWithCheckMark = (props: ImageProps) => {
  const { className, src, ...imageProps } = props
  return (
    <div className={className}>
      <span className='bg-highlight-1' {...imageProps}>
        {src}
      </span>
    </div>
  )
}

ClipBoardWithCheckMark.defaultProps = {
  src: <ClipBoardWithCheckMarkSvg />,
  alt: 'check mark icon',
  width: '64',
  height: '64'
}
