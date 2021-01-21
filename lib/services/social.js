const VERIFIED_JSON = 'https://api.github.com/repos/uniswap/sybil-list/contents/verified.json'
const TWITTER_WORKER_URL = 'https://twitter-worker.uniswap.workers.dev'

export async function fetchAllIdentities() {
  try {
    return fetch(VERIFIED_JSON)
      .then(async (res) => {
        if (!res || res.status !== 200) {
          return Promise.reject('Unable to fetch verified handles')
        } else {
          return res
            .json()
            .then((data) => {
              const content = data.content
              const decodedContent = atob(content)
              const parsed = JSON.parse(decodedContent)
              return parsed
            })
            .catch(() => {
              return Promise.reject('Error fetch verified handle data')
            })
        }
      })
      .catch(() => {
        return undefined
      })
  } catch (e) {
    return Promise.reject('Error fetch verified handle data')
  }
}

export function fetchTwitterProfileData(handle) {
  const url = `${TWITTER_WORKER_URL}/user?handle=${handle}`
  try {
    return fetch(url)
      .then(async (res) => {
        if (res.status === 200) {
          return res.json()
        } else {
          Promise.reject('No handle found')
          return null
        }
      })
      .catch((error) => {
        return Promise.reject(error)
      })
  } catch {
    return Promise.reject('Error fetching profile data')
  }
}
