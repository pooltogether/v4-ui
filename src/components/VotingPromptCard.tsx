import { useAllProposalsByStatus } from '@pooltogether/hooks'
import classNames from 'classnames'
import FeatherIcon from 'feather-icons-react'
import { useTranslation } from 'react-i18next'

export const VotingPromptCard = (props: { className?: string }) => {
  const { className } = props
  const { t } = useTranslation()
  const { data, isFetched, error } = useAllProposalsByStatus()
  if (error || !isFetched) return null

  const activeProposalsCount = data.active.length
  if (activeProposalsCount === 0) return null

  return (
    <a
      className={classNames('hover:opacity-70 transition-opacity block', className)}
      href='https://vote.pooltogether.com/proposals'
      target='_blank'
    >
      <div className='rounded-lg p-4 bg-pt-purple-lightest dark:bg-pt-purple dark:bg-opacity-40 flex flex-row-reverse xs:flex-row justify-between'>
        <span className='text-6xl xs:text-4xl'>🗳</span>
        <div className='xs:ml-2 flex flex-col space-y-3 xs:space-y-0 xs:flex-row xs:justify-between xs:w-full'>
          <div className='text-pt-purple-dark dark:text-pt-purple-lighter flex flex-col justify-center space-y-1 leading-none'>
            <span className='font-bold'>{t('pooltogetherGovernance')}</span>
            <span>{t('activeProposalsCount', { count: activeProposalsCount })}</span>
          </div>
          <div className='flex items-center space-x-2'>
            <span>{t('viewProposal', { count: activeProposalsCount })}</span>
            <FeatherIcon icon={'external-link'} className='w-4 h-4' />
          </div>
        </div>
      </div>
    </a>
  )
}
