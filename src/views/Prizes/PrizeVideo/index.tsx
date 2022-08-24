import { LoadingCard } from './LoadingCard'

export const PrizeVideo: React.FC<{ className?: string; isLoading?: boolean }> = (props) => {
  const { className, isLoading } = props

  if (isLoading) return <LoadingCard className={className} />

  return <div></div>
}
