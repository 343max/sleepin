$.when(
    $.getJSON('/peers.json'),
    $.ready
).then((data) => {
    const $addressBook = $('#address_book').empty()

    for (i in data[0]) {
        const peer = data[0][i]

        const $div = $('<div>').addClass('peer')
        $div.append($('<label>').text(peer.name))

        $div.click(() => {
            $.post('/call/' + peer.id)
        })

        $addressBook.append($div)
    }

    $('button.hang_up').click(() => {
        $.post('/hang_up')
    })

    var state
    const poll = () => {
        setTimeout(() => {
            $.get('/state.json', (newState) => {
                poll()
                if (newState == state) {
                    return
                }
                state = newState

                if (state == 'in_call' || state == 'prepare_call') {
                    $('#incall').show()
                    $('#address_book').hide()
                    $('.call_info>label').text('')
                    $.get('/calling_party.json', (peer) => {
                        $('.call_info>label').text(peer.name)  
                    })
                } else {
                    $('#incall').hide()
                    $('#address_book').show()
                }
            })
        }, 100)
    }
    poll()
})