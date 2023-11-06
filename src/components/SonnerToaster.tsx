import { Toaster as SonnerToaster } from 'sonner'

interface SonnerToasterProps {
  invert?: boolean
  theme?: 'light' | 'dark'
  position?:
    | 'top-left'
    | 'top-right'
    | 'bottom-left'
    | 'bottom-right'
    | 'top-center'
    | 'bottom-center'
  hotkey?: string[]
  richColors?: boolean
  expand?: boolean
  duration?: number
  visibleToasts?: number
  closeButton?: boolean
  toastOptions?: { className?: string; descriptionClassName?: string; style?: React.CSSProperties }
  className?: string
  style?: React.CSSProperties
  offset?: string | number
}

export interface ToasterProps extends SonnerToasterProps {}

export const Toaster = (props: ToasterProps) => {
  const { duration, offset, style, toastOptions, ...rest } = props

  return (
    <SonnerToaster
      theme='dark'
      position='top-right'
      duration={duration ?? 300_000}
      offset={offset ?? '4.5rem'}
      style={{ fontSize: '0.5rem', marginRight: '-3.5rem', ...style }}
      toastOptions={{
        className: toastOptions?.className,
        descriptionClassName: toastOptions?.descriptionClassName,
        style: {
          padding: '1.5rem',
          backgroundColor: '#4C249F',
          borderRadius: '0.5rem',
          ...toastOptions?.style
        }
      }}
      {...rest}
    />
  )
}
