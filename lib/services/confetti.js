import { CONFETTI_DURATION_MS } from 'lib/constants'

const debug = require('debug')('confetti')

let _confetti
let intId

export const confetti = {
  // (setTimeout, setInterval)
  start: () => {
    // debug('starting...', window.confettiCtx, window.confettiCtx.ConfettiClass)

    intId = setInterval(() => {
      if (!window || !window.confettiCtx || !intId) {
        return
      }

      debug('CLEARING INTERVAL')
      clearInterval(intId)
      intId = null

      if (!_confetti) {
        debug('CREATING NEW CONFETTI CONTEXT')
        _confetti = new window.confettiCtx.ConfettiClass('confettiCanvas', debug)

        window.addEventListener('resize', function (event) {
          _confetti.resize()
        })
      }

      _confetti.start()

      const confettiCanvasElem = document.querySelectorAll('.confettiCanvas')[0]
      if (confettiCanvasElem) {
        confettiCanvasElem.classList.add('active')
      }

      setTimeout(() => {
        const confettiCanvasElem = document.querySelectorAll('.confettiCanvas')[0]
        if (confettiCanvasElem) {
          confettiCanvasElem.classList.remove('active')
        }

        setTimeout(() => {
          _confetti.stop()
        }, 2000)
      }, CONFETTI_DURATION_MS)
    }, 100)
  },

  stop: () => {
    const confettiCanvasElem = document.querySelectorAll('.confettiCanvas')[0]
    if (confettiCanvasElem) {
      confettiCanvasElem.classList.remove('active')
    }

    if (!_confetti) {
      _confetti = new window.confetti.ConfettiClass('confettiCanvas', debug)
    }

    _confetti.stop()
  }
}
