const $ = require('jquery')
const app = require('electron').remote.app
const path = require('path')
const fs = require('fs')
const ipcRenderer = require('electron').ipcRenderer

var DEBUG = false
ipcRenderer.on('DEBUG', (event, debug) => {
    DEBUG = debug
})

function log_it(event_name, e) {
    console.log(e.type)
    console.dir(e)
}

const peers = (() => {
    const peers_path = path.join(app.getPath('userData'), 'peers.json')
    if (!fs.existsSync(peers_path)) {
        alert('Address book ' + peers_path + ' doesn\'t exist. Please copy the sample address book peers.sample.json and customize it.');
        app.quit()
        return []
    }

    var data
    try {
        data = JSON.parse(fs.readFileSync(peers_path))
    }
    catch(e) {
        console.dir(e)
        alert('Couldn\'t read address book ' + peers_path + ' . Please make sure it contains an array of perrs {id, name, image_src}\n\n' + e)
        app.quit()
        return []
    }

    return data
})()

const states = require('./states.js')
const stateHandlers = {
    [states.call_finished]: () => {
        start_screensaver()
        setState(states.idle)
    }
}

var state = states.idle
function setState(newState) {
    if (state == newState) {
        return
    }

    const func = stateHandlers[newState]
    if (!func) {
        console.warn('no state handler for ' + newState)
    } else {
        func(state)
    }

    state = newState
}

function launch_server() {
    const express = require('express')
    const app = express()
    const port = 8888

    app.use(express.static(path.join(__dirname, 'remote')))

    app.get('/', (req, res) => {
        res.render('index.html')
    })

    app.get('/peers.json', (req, res) => {
        res.json(peers)
    })

    app.get('/state.json', (req, res) => {
        res.json(state)
    })

    app.get('/calling_party.json', (req, res) => {
        res.json(calling_party)
    })

    app.post('/call/:peer_id', (req, res) => {
        res.json(true)
        start_call(req.params['peer_id'])
    })

    app.post('/hang_up', (req, res) => {
        res.json(true)
        browser.send('hang_up')
    })

    app.listen(port, (err) => {
        if (err) {
            return console.log('something bad happened', err)
        }

        console.log(`server is listening on ${port}`)
    })
}

function present(o) {
    $('#stage>*').detach()
    $('#stage').append(o)
}

function start_screensaver() {
    const screensaver_path = path.join(app.getPath('userData'), 'Screensaver')
    fs.readdir(screensaver_path, (err, items) => {
      if (err) {
          present($('<div>').addClass('screensaver_error').text('couldn\'t load screensavers: ' + err.message))
      } else if(items.length == 0) {
          present($('<div>').addClass('screensaver_error').text('couldn\'t load screensavers: no videos in ' + screensaver_path))
      } else {
          const video_name = items[Math.floor(Math.random() * items.length)]
          const $video = $('<video>').attr('src', path.join(screensaver_path, video_name)).addClass('screensaver')
          $video.on("loadedmetadata", function () {
              const video = $video[0]
              video.volume = 0
              video.loop = true
              video.currentTime = Math.random() * video.duration
              video.play()
          });
          present($video)
      }
    })

    // kill the screensave video after 5 minutes because it takes up a lot of time
    setTimeout(() => {
        $('.screensaver').detach()
    }, 1000 * 60 * 5)
}

var browser
function start_browser(url) {
    const $browser = $('<webview>')
                        .attr('autoresize', 'yes')
                        .attr('src', url)
                        .attr('preload', path.join(__dirname, 'inject.js'))
                        .addClass('browser')
    present($browser)
    browser = $browser[0]
    do_layout()

    const ipcHandlers = {
        'setState': (args) => {
            const newState = args[0]
            setState(newState)
        }
    }

    browser.addEventListener('console-message', (e) => {
        console.log('webview:', e.message)
        console.dir(e)
    })

    browser.addEventListener('ipc-message', (e) => {
        const func = ipcHandlers[e.channel]
        if (func == null) {
            console.warn('no IPC handler for ' + e.channel + ' ' + json.stringify(e.args))
        } else {
            func(e.args)
        }
    })

    if (DEBUG) {
        browser.addEventListener('dom-ready', () => {
            browser.openDevTools()
        })
    }
}

var calling_party
function start_call(peer_id) {
    for(var i in peers) {
        const peer = peers[i]
        if (peer.id == peer_id) {
            calling_party = peer
            break
        }
    }
    start_browser('https://www.messenger.com/videocall/incall/?peer_id=' + peer_id)
}

onload = function () {
    launch_server()
    start_screensaver()
    window.onresize = do_layout;
}

function do_layout() {
    if (browser) {
        browser.style.width = document.documentElement.clientWidth + 'px';
        browser.style.height = document.documentElement.clientHeight + 'px';
    }
}