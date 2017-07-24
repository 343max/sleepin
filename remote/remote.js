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
})