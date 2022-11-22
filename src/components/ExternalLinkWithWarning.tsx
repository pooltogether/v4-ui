import { ButtonLink, ExternalLink, Modal } from '@pooltogether/react-components'
import FeatherIcon from 'feather-icons-react'
import { Trans, useTranslation } from 'next-i18next'
import { useState } from 'react'
import { ListItem } from './List/ListItem'

export const ExternalLinkWithWarning = (props: {
  left: React.ReactNode
  right: React.ReactNode
  href: string
  twitter?: string
  discordName?: string
  discordId?: string
  github?: string
  repo?: string
  ignoreNoRepo?: boolean
}) => {
  const { left, right, href, twitter, github, repo, ignoreNoRepo, discordId, discordName } = props
  const { t } = useTranslation()
  const [isOpen, setIsOpen] = useState(false)

  return (
    <>
      <ListItem left={left} right={right} onClick={() => setIsOpen(true)} />
      <Modal
        isOpen={isOpen}
        closeModal={() => setIsOpen(false)}
        label={'external-dapp-link'}
        className='flex flex-col items-center'
      >
        <span className='text-5xl mb-4'>👋</span>
        <div className='text-center mb-8'>
          <p className='text-lg mb-6'>
            {t('headsUpLeavingPT', `Heads up, you're leaving PoolTogether.com`)}
          </p>
          <UserLink
            twitter={twitter}
            github={github}
            discordId={discordId}
            discordName={discordName}
          />
          <RepoLink repo={repo} ignoreNoRepo={ignoreNoRepo} />
        </div>
        <ButtonLink href={href} className='w-full space-x-2 items-center'>
          <span>{t('iUnderstand')}</span>
          <FeatherIcon icon={'external-link'} className='w-4 h-4' />
        </ButtonLink>
      </Modal>
    </>
  )
}

ExternalLinkWithWarning.defaultProps = {
  right: ''
}

const UserLink: React.FC<{
  twitter?: string
  github?: string
  discordId?: string
  discordName?: string
}> = (props) => {
  const { twitter, github, discordId, discordName } = props

  if (twitter || github || (discordId && discordName)) {
    let url
    if (!!twitter) {
      url = `https://twitter.com/${twitter}`
    } else if (!!github) {
      url = `https://github.com/${github}`
    } else {
      url = `https://discord.com/users/${discordId}/`
    }

    return (
      <p className='text-xs'>
        <Trans
          i18nKey='redirectedToApp'
          components={{
            a: <ExternalLink href={url} children={undefined} />
          }}
          values={{ name: twitter || github || discordName }}
        />
      </p>
    )
  }

  return null
}

const RepoLink: React.FC<{ repo?: string; ignoreNoRepo?: boolean }> = (props) => {
  const { repo, ignoreNoRepo } = props
  const { t } = useTranslation()

  if (ignoreNoRepo) return null

  if (!repo) {
    return (
      <p className='text-xs text-pt-red-light'>
        {t('appNotOpenSource', 'This app is not open source. The code cannot be verified.')}
      </p>
    )
  }

  return (
    <p className='text-xs'>
      <Trans
        i18nKey='openSourceAppVerifyHere'
        components={{ a: <ExternalLink href={repo} children={undefined} /> }}
      />
    </p>
  )
}
