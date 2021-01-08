import { queryParamUpdater } from '../queryParamUpdater'

describe('queryParamUpdater', () => {

  describe('add', () => {
    it('updates a path that has no query', () => {
      const router = {
        pathname: '/[var]',
        asPath: '/asdf',
        push: jest.fn()
      }

      queryParamUpdater.add(router, { method: 'crypto' })

      expect(router.push).toHaveBeenCalledWith(
        "/[var]?method=crypto",
        "/asdf?method=crypto",
        { "shallow": true }
      )
    })

    it('updates a path that already has query params', () => {
      const router = {
        pathname: '/[var]?blanko=nino',
        asPath: '/asdf?blanko=nino',
        query: { blanko: 'nino' },
        push: jest.fn()
      }
      
      queryParamUpdater.add(router, { method: 'crypto' })

      expect(router.push).toHaveBeenCalledWith(
        "/[var]?blanko=nino&method=crypto",
        "/asdf?blanko=nino&method=crypto",
        { "shallow": true }
      )
    })

    it('does nothing if the param already exists', () => {
      const router = {
        pathname: '/[var]?method=crypto',
        asPath: '/asdf?method=crypto',
        push: jest.fn()
      }

      queryParamUpdater.add(router, { method: 'crypto' })

      expect(router.push).toHaveBeenCalledWith(
        "/[var]?method=crypto",
        "/asdf?method=crypto",
        { "shallow": true }
      )
    })
  })

  describe('removeAll', () => {
    it('gets rid of all query params', () => {
      const router = {
        pathname: '/[var]?hello=there&yes=yo',
        asPath: '/asdf?hello=there&yes=yo',
        push: jest.fn()
      }

      queryParamUpdater.removeAll(router)

      expect(router.push).toHaveBeenCalledWith(
        "/[var]",
        "/asdf",
        { "shallow": true }
      )
    })
  })

  describe('remove', () => {
    it('gets rid of a specific query param', () => {
      const router = {
        pathname: '/[var]?hello=there&yes=yo',
        asPath: '/asdf?hello=there&yes=yo',
        push: jest.fn()
      }

      queryParamUpdater.remove(router, 'hello')

      expect(router.push).toHaveBeenCalledWith(
        "/[var]?yes=yo",
        "/asdf?yes=yo",
        { "shallow": true }
      )
    })

    it('cleans up the "?" symbol if no params remain', () => {
      const router = {
        pathname: '/[var]?yes=yo',
        asPath: '/asdf?yes=yo',
        push: jest.fn()
      }

      queryParamUpdater.remove(router, 'yes')

      expect(router.push).toHaveBeenCalledWith(
        "/[var]",
        "/asdf",
        { "shallow": true }
      )
    })
  })

})
