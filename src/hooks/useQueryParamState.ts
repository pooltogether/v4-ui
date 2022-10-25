import { useRouter } from 'next/router'

export const useQueryParamState = (
  key: string,
  initialValue: string = null,
  validValues?: string[]
) => {
  const router = useRouter()
  let data = initialValue
  const queryValue = router.query[key]
  if (!!queryValue && !Array.isArray(queryValue)) {
    if (!!validValues) {
      if (validValues.includes(queryValue)) {
        data = queryValue
      }
    } else {
      data = queryValue
    }
  }

  const setData = (data: string) => {
    const url = new URL(window.location.href)
    const query = Object.fromEntries(new URLSearchParams(url.search).entries())
    return router.push({ query: { ...query, [key]: data } }, undefined, {
      shallow: true
    })
  }

  const deleteData = () => {
    const url = new URL(window.location.href)
    const _query = new URLSearchParams(url.search)
    _query.delete(key)
    const query = Object.fromEntries(_query.entries())
    return router.push({ query }, undefined, { shallow: true })
  }

  return { data, setData, deleteData }
}
