/**
 * Reads a value from query params.
 * Returns the default or null if no value is found for that key.
 * Optionally validates data against validValues.
 * @param key
 * @param options
 * @returns
 */
export const parseQueryParam = (
  key: string,
  options?: { default?: string; validValues?: string[] }
) => {
  if (typeof window === 'undefined') {
    return null
  }
  const url = new URL(window.location.href)
  const queryParams = new URLSearchParams(url.search)
  const value = queryParams.get(key)

  if (
    !value ||
    typeof value !== 'string' ||
    (!!options?.validValues && !options?.validValues.includes(value))
  ) {
    return options?.default || null
  }

  return value
}
