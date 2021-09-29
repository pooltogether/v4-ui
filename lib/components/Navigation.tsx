import classnames from 'classnames'
import { ContentPaneState } from 'lib/views/DefaultPage'
import { useTranslation } from 'react-i18next'

export const Navigation = (props) => {
  const { t } = useTranslation()
  const { className, depositSelected, prizesSelected, accountSelected, setSelectedPage } = props

  return (
    <nav
      className={classnames(
        className,
        'max-w-max flex flex-row rounded-xl bg-darkened p-1 font-inter',
        '',
        'fixed xs:static bottom-0 inset-x-0 z-20 shadow-lg'
      )}
    >
      <NavTab
        setSelectedPage={setSelectedPage}
        page={ContentPaneState.deposit}
        isSelected={depositSelected}
      >
        {t('deposit')}
      </NavTab>
      <NavTab
        setSelectedPage={setSelectedPage}
        page={ContentPaneState.prizes}
        isSelected={prizesSelected}
      >
        {t('prizes')}
      </NavTab>
      <NavTab
        setSelectedPage={setSelectedPage}
        page={ContentPaneState.account}
        isSelected={accountSelected}
      >
        {t('account')}
      </NavTab>
    </nav>
  )
}

const NavTab = (props) => {
  const { setSelectedPage, page, isSelected, ...buttonProps } = props
  return (
    <a
      {...buttonProps}
      className={classnames(
        'transition mx-1 first:ml-0 last:mr-0 rounded-lg px-3 py-1 flex flex-row hover:bg-light-purple-10 active:bg-tertiary',
        { 'bg-tertiary': isSelected }
      )}
      onClick={() => setSelectedPage(page)}
    />
  )
}
