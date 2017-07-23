const $ = require('jquery')
const app = require('electron').remote.app
const path = require('path')

function log_it(event_name, e) {
    console.log(event_name + ' ' + Date())
    console.dir(e)
}

function launch_server() {
    const express = require('express')
    const app = express()
    const port = 8080

    app.use(express.static(path.join(__dirname, 'remote')))

    app.get('/', (req, res) => {
        res.render('index.html')
    })

    app.get('/call/:peer_id', (req, res) => {
        console.dir(req.params)
        res.end('done!')
    })

    app.get('/peers.json', (req, res) => {
        res.json(
            [
                {
                    name: 'Alice',
                    id: '12345'
                }
            ]
        )
    })

    app.listen(port, (err) => {
        if (err) {
            return console.log('something bad happened', err)
        }

        console.log(`server is listening on ${port}`)
    })
}

launch_server()

function cleanup_stage() {
    $('#stage>*').detach()
}

function start_screensaver() {
    cleanup_stage()

    const screensaver_path = path.join(app.getPath('userData'), 'Screensaver')
    const fs = require('fs')
    fs.readdir(screensaver_path, (err, items) => {
      if (err) {
          $('#stage').append($('<div>').addClass('screensaver_error').text('couldn\'t load screensavers: ' + err.message))
      } else if(items.length == 0) {
          $('#stage').append($('<div>').addClass('screensaver_error').text('couldn\'t load screensavers: no videos in ' + screensaver_path))
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
          $('#stage').append($video)
      }
    })
}

var browser
function start_call(peer_id) {
    
}

onload = function () {
    start_screensaver()
    // browser = document.querySelector('#browser');
    // doLayout();
    // window.onresize = doLayout;
    // browser.addEventListener('console-message', (e) => {
    //     console.log('Guest page logged a message:', e.message)
    // })

    // browser.addEventListener('dom-ready', () => {
    //     browser.openDevTools()
    // })

    // browser.addEventListener('load-commit', (e) => { log_it('load-commit', e) })
    // browser.addEventListener('did-finish-load', (e) => { log_it('did-finish-load', e) })
    // browser.addEventListener('did-fail-load', (e) => { log_it('did-fail-load', e) })
    // browser.addEventListener('did-frame-finish-load', (e) => { log_it('did-frame-finish-load', e) })
    // browser.addEventListener('did-start-loading', (e) => { log_it('did-start-loading', e) })
    // browser.addEventListener('did-stop-loading', (e) => { log_it('did-stop-loading', e) })
    // browser.addEventListener('did-get-response-details', (e) => { log_it('did-get-response-details', e) })
    // browser.addEventListener('did-get-redirect-request', (e) => { log_it('did-get-redirect-request', e) })
    // browser.addEventListener('dom-ready', (e) => { log_it('dom-ready', e) })
    // browser.addEventListener('page-title-updated', (e) => { log_it('page-title-updated', e) })
    // browser.addEventListener('page-favicon-updated', (e) => { log_it('page-favicon-updated', e) })
    // browser.addEventListener('enter-html-full-screen', (e) => { log_it('enter-html-full-screen', e) })
    // browser.addEventListener('leave-html-full-screen', (e) => { log_it('leave-html-full-screen', e) })
    // browser.addEventListener('found-in-page', (e) => { log_it('found-in-page', e) })
    // browser.addEventListener('new-window', (e) => { log_it('new-window', e) })
    // browser.addEventListener('will-navigate', (e) => { log_it('will-navigate', e) })
    // browser.addEventListener('did-navigate', (e) => { log_it('did-navigate', e) })
    // browser.addEventListener('did-navigate-in-page', (e) => { log_it('did-navigate-in-page', e) })
    // browser.addEventListener('close', (e) => { log_it('close', e) })
    // browser.addEventListener('ipc-message', (e) => { log_it('ipc-message', e) })
    // browser.addEventListener('crashed', (e) => { log_it('crashed', e) })
    // browser.addEventListener('gpu-crashed', (e) => { log_it('gpu-crashed', e) })
    // browser.addEventListener('plugin-crashed', (e) => { log_it('plugin-crashed', e) })
    // browser.addEventListener('destroyed', (e) => { log_it('destroyed', e) })
    // browser.addEventListener('media-started-playing', (e) => { log_it('media-started-playing', e) })
    // browser.addEventListener('media-paused', (e) => { log_it('media-paused', e) })
    // browser.addEventListener('did-change-theme-color', (e) => { log_it('did-change-theme-color', e) })
    // browser.addEventListener('update-target-url', (e) => { log_it('update-target-url', e) })
    // browser.addEventListener('devtools-opened', (e) => { log_it('devtools-opened', e) })
    // browser.addEventListener('devtools-closed', (e) => { log_it('devtools-closed', e) })
    // browser.addEventListener('devtools-focused', (e) => { log_it('devtools-focused', e) })
}

function doLayout() {
    if (browser) {
        browser.style.width = document.documentElement.clientWidth + 'px';
        browser.style.height = document.documentElement.clientHeight + 'px';
    }
}