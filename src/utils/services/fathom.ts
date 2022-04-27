export enum FathomEvent {
  'approveDeposit' = 'YHCCMXBB',
  'deposit' = 'TPW7LFIM',
  'withdrawal' = '3JYMDT8G',
  'prizeClaim' = 'EVLWAG9O'
}

export const logEvent = (event: FathomEvent, value: number = 1) => {
  if (window['fathom']) {
    window['fathom'].trackGoal(event, value)
  }
}
