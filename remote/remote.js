$.when(
    $.getJSON('/peers.json'),
    $.ready
).then((data) => {
    console.log('hello!')
    console.dir(data[0])

    for (i in data[0]) {
        peer = data[0][i]
        console.dir(peer)
    }
})