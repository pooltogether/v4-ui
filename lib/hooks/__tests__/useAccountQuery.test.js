import React from 'react'
import nock from 'nock'
import { renderHook, act } from '@testing-library/react-hooks'
import { ReactQueryCacheProvider, QueryCache } from 'react-query'

import { useAccountQuery } from '../useAccountQuery'

describe('useAccountQuery', () => {

  // Currently using AuthControllerContext in hook requires a lot more boilerplate
  xit('santizes the address', async () => {
    const queryCache = new QueryCache()

    // const contextValues = { chainId: 1 }
    
    const wrapper = ({ children }) => (
      <ReactQueryCacheProvider queryCache={queryCache}>
        {children}
      </ReactQueryCacheProvider>
    )

    const expectation = nock('https://api.thegraph.com')
      .get('/subgraphs/name/pooltogether/pooltogether-v3_1_0')
      .reply(200, {
        answer: 42
      })

    const { result, waitFor } = renderHook(() => useAccountQuery(), { wrapper })

    await waitFor(() => {
      return result.current.isSuccess
    })

    expect(result.current).toEqual({ answer: 42 })
  })

})
