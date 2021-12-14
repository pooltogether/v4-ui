import { Time as PTTime, TimeProps } from '@pooltogether/react-components'

export const Time = (props: TimeProps) => <PTTime {...props} />

Time.defaultProps = {
  hideDays: true,
  getTimeColorClassName: (seconds) => {
    // 1 hour
    if (seconds >= 3600) {
      return 'text-highlight-6'
      // 30 minutes
    } else if (seconds >= 3600) {
      return 'text-orange'
    } else {
      return 'text-functional-red'
    }
  }
}
