import classNames from 'classnames'
import { DetailedHTMLProps, HTMLAttributes } from 'react'

interface PagePaddingProps
  extends DetailedHTMLProps<HTMLAttributes<HTMLDivElement>, HTMLDivElement> {}

export const PagePadding = (props: PagePaddingProps) => {
  const { className, ...divProps } = props
  return <div {...divProps} className={classNames(className, 'max-w-xl mx-auto px-2 pb-20')} />
}
