import { useRouter } from 'next/router'

import { URL_QUERY_KEY } from 'lib/constants/urlQueryKeys'

export enum ContentPaneState {
  deposit = 'deposit',
  prizes = 'prizes',
  account = 'account'
}

export const useSelectedPage = () => {
  const router = useRouter()
  const selected = router.query[URL_QUERY_KEY.tab] || ContentPaneState.deposit

  const depositSelected = selected === ContentPaneState.deposit
  const prizesSelected = selected === ContentPaneState.prizes
  const accountSelected = selected === ContentPaneState.account

  const setSelectedPage = (newTab: ContentPaneState) => {
    const { query, pathname } = router
    query[URL_QUERY_KEY.tab] = newTab
    router.replace({ pathname, query })
  }

  return { setSelectedPage, depositSelected, prizesSelected, accountSelected }
}
