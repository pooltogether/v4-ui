import { useAllProposalsByStatus } from '@pooltogether/hooks'
import classNames from 'classnames'
import FeatherIcon from 'feather-icons-react'
import { useTranslation } from 'react-i18next'

export const VotingPromptCard = (props: { className?: string; persist?: boolean }) => {
  const { className, persist } = props
  const { t } = useTranslation()
  const { data, isFetched, error } = useAllProposalsByStatus()
  if (error || !isFetched) return null

  const activeProposalsCount = 0 //data.active.length
  const noProposals = activeProposalsCount === 0
  if (noProposals && !persist) return null

  return (
    <a
      className={classNames('hover:opacity-70 transition-opacity block', className)}
      href='https://vote.pooltogether.com/proposals'
      target='_blank'
    >
      <div className='rounded-lg px-8 py-4 xs:py-2 bg-pt-purple-lightest dark:bg-pt-purple dark:bg-opacity-40 flex flex-row-reverse xs:flex-row justify-between'>
        <span
          className={classNames({
            'text-6xl xs:text-4xl': !noProposals,
            'text-xl': noProposals
          })}
        >
          🗳
        </span>
        <div className='xs:ml-2 flex flex-col space-y-1 xs:space-y-0 xs:flex-row xs:justify-between xs:w-full'>
          <div className='text-pt-purple-dark dark:text-pt-purple-lighter flex flex-col justify-center space-y-1 leading-none'>
            <span className='font-bold'>{t('pooltogetherGovernance')}</span>
            {!noProposals && (
              <span>{t('activeProposalsCount', { count: activeProposalsCount })}</span>
            )}
          </div>
          <div className='flex items-center space-x-2'>
            <span>
              {noProposals ? t('view') : t('viewProposal', { count: activeProposalsCount })}
            </span>
            <FeatherIcon icon={'external-link'} className='w-4 h-4' />
          </div>
        </div>
      </div>
    </a>
  )
}
