import classnames from 'classnames'
import { useTranslation } from 'react-i18next'

import { ContentPaneState, useSelectedPage } from 'lib/hooks/useSelectedPage'

export const Navigation = (props) => {
  const { t } = useTranslation()
  const { className } = props

  const { setSelectedPage, depositSelected, prizesSelected, accountSelected } = useSelectedPage()

  return (
    <nav
      className={classnames(
        className,
        'mx-auto mb-6',
        'sm:absolute sm:-mt-1 sm:bottom-auto',
        'max-w-max flex flex-row rounded-xl bg-pt-purple-bright p-1 font-inter',
        'fixed bottom-0 inset-x-0 z-20 shadow-lg'
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
        'transition mx-1 first:ml-0 last:mr-0 rounded-lg px-3 py-1 flex flex-row',
        'text-xs hover:text-inverse active:bg-tertiary',
        { 'bg-tertiary text-inverse': isSelected },
        { 'text-accent-1 hover:bg-light-purple-10': !isSelected }
      )}
      onClick={() => setSelectedPage(page)}
    />
  )
}
