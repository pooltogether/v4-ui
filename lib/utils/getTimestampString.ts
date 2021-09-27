export const getTimestampString = (
  timestamp: number,
  options: Intl.DateTimeFormatOptions = {
    weekday: 'long',
    month: 'long',
    day: 'numeric'
  }
) => new Date(timestamp * 1000).toLocaleDateString('en-US', options)

export const getTimestampStringWithTime = (
  timestamp: number,
  options: Intl.DateTimeFormatOptions = {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    //
    hour: 'numeric',
    minute: 'numeric'
  }
) => new Date(timestamp * 1000).toLocaleDateString('en-US', options)
