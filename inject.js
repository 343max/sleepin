(() => {
    if (!document.location.href.match('^https://www.messenger.com/videocall/incall')) {
        return;
    }
    
    const { ipcRenderer } = require('electron')
    const states = {
        prepare_call: 'prepare_call',
        in_call: 'in_call',
        call_finished: 'call_finished'
    }

    const stateHandlers = {
        'prepare_call': () => {
            var intervalHandler = window.setInterval(() => {
                // find button in the center of the screen
                const pageCenter = { x: window.innerWidth / 2, y: window.innerHeight / 2 }
                const buttons = document.querySelectorAll('button')

                var bestMatch = null
                // ignore buttons that are to far from the center of the page
                var maxDistance = Math.sqrt(Math.pow(pageCenter.x, 2) + Math.pow(pageCenter.y, 2)) / 2

                for (var i = 0; i < buttons.length; i++) {
                    const button = buttons[i]
                    const bounds = button.getBoundingClientRect()
                    const buttonCenter = { x: (bounds.right - bounds.left) / 2 + bounds.left, y: (bounds.bottom - bounds.top) / 2 + bounds.top }
                    const distance = Math.sqrt(Math.pow(pageCenter.x - buttonCenter.x, 2) + Math.pow(pageCenter.y - buttonCenter.y, 2))

                    if (distance < maxDistance) {
                        maxDistance = distance
                        bestMatch = button
                    }
                }

                if (bestMatch) {
                    clearInterval(intervalHandler)
                    bestMatch.click()
                }

            }, 100)
        }
    }

    var state = ''
    function setState(newState) {
        if (state == newState) {
            return
        }

        state = newState
        console.log('new state: ' + state)
        ipcRenderer.sendToHost('setState', state)

        const func = stateHandlers[state]
        if (func == null) {
            console.warn('no state handler for state ' + state)
        } else {
            func()
        }
    }

    document.addEventListener("DOMContentLoaded", function (event) {
        setState(states.prepare_call)
        setInterval(() => {
            const hasVideo = document.querySelector('video') != null
            if (hasVideo) {
                setState(states.in_call)
            } else if (state == states.in_call) {
                setState(states.call_finished)
            }
        }, 100)
    });
})()