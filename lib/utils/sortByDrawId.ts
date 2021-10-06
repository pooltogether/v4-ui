import { Draw } from '@pooltogether/v4-js-client'

export const sortDrawsByDrawId = (a: Draw, b: Draw) => b.drawId - a.drawId
