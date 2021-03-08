const queryString = require('query-string')

export const queryParamUpdater = {
  add: (router, addition) => {
    const pathnameParts = [].concat(router.pathname.split('?'))
    const asPathParts = [].concat(router.asPath.split('?'))

    const hasQueryParams = /\?/.test(router.asPath)

    let newParams = { ...addition }
    if (hasQueryParams) {
      const existing = queryString.parse(`?${asPathParts.pop()}`)

      newParams = {
        ...existing,
        ...addition
      }
    }

    const newPathname = `${pathnameParts.shift()}?${queryString.stringify(newParams)}`
    const newAsPath = `${asPathParts.shift()}?${queryString.stringify(newParams)}`

    router.push(newPathname, newAsPath, { shallow: true })

    return router.asPath.toString()
  },

  removeAll: (router) => {
    const pathnameParts = [].concat(router.pathname.split('?'))
    const asPathParts = [].concat(router.asPath.split('?'))

    const newPathname = pathnameParts.shift()
    const newAsPath = asPathParts.shift()

    router.push(newPathname, newAsPath, { shallow: true })

    return router.asPath.toString()
  },

  remove: (router, key) => {
    const pathnameParts = [].concat(router.pathname.split('?'))
    const asPathParts = [].concat(router.asPath.split('?'))

    const hasQueryParams = /\?/.test(router.asPath)

    if (hasQueryParams) {
      const existing = queryString.parse(`?${asPathParts.pop()}`)

      delete existing[key]

      let hasNoMoreKeys = true
      for (const key of Object.keys(existing)) {
        hasNoMoreKeys = false
      }

      if (hasNoMoreKeys) {
        router.push(pathnameParts.shift(), asPathParts.shift(), { shallow: true })
      } else {
        const newPathname = `${pathnameParts.shift()}?${queryString.stringify(existing)}`
        const newAsPath = `${asPathParts.shift()}?${queryString.stringify(existing)}`

        router.push(newPathname, newAsPath, { shallow: true })
      }
    }

    return router.asPath.toString()
  }
}
