const retryCodes = [408, 500, 502, 503, 504, 522, 524]
const sleep = async (retry) => await new Promise((r) => setTimeout(r, 500 * retry))

/**
 * Custom fetch wrapper for the query clients so we can handle errors better and retry queries
 * NOTE: retries is starting at 3 so we don't actually retrys
 * @param {*} request
 * @param {*} options
 * @param {*} retry
 * @returns
 */
export const theGraphCustomFetch = async (request, options, retry = 3) =>
  fetch(request, options)
    .then(async (response) => {
      if (response.ok) return response

      if (retry < 3 && retryCodes.includes(response.status)) {
        await sleep(retry)
        return theGraphCustomFetch(request, options, retry + 1)
      }

      throw new Error(JSON.stringify(response))
    })
    .catch((reason) => {
      console.log(reason)
      return reason
    })
