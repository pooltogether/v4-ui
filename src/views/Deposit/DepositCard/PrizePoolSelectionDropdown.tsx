import { SelectAppChainIdModal } from '@components/SelectAppChainIdModal'
import { useSelectedPrizePool } from '@hooks/v4/PrizePool/useSelectedPrizePool'
import { useTranslation } from 'react-i18next'

export const PrizePoolSelectionDropdown: React.FC<{ className?: string }> = (props) => {
  const prizePool = useSelectedPrizePool()
  const { t } = useTranslation()

  return (
    <div className='flex flex-col'>
      <span className='text-xs uppercase font-semibold text-pt-purple-dark text-opacity-60 dark:text-pt-purple-lighter mb-1'>
        Prize Pool
      </span>
      <SelectAppChainIdModal className='network-dropdown' />
    </div>
  )
}
