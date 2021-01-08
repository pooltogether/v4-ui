if (typeof window !== 'undefined') {
  window.showGraphError = function () {
    setTimeout(
      () => { 
        const elem = document.getElementById('graph-error-modal')

        if (elem) {
          elem.classList.remove('hidden')
        }
      }
    , 2000)
  }

  window.hideGraphError = function () {
    const elem = document.getElementById('graph-error-modal')

    if (elem) {
      elem.classList.add('hidden')
    }
  }
}