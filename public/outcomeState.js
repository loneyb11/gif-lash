function outcomeState(){

    nsSocket.on('gameStateOutcome', (data) => {
        $('#gameWindow').empty();
        $('#gameWindow').append(data.html);
        $('.announcer-text').text(data.text)
    });

    nsSocket.on('gameStateFinalOutcome', (data) => {
        $('#gameWindow').empty();
        $('#gameWindow').append(data.html);
        $('#timer-box').empty();
        $('.announcer-text').text(data.text)
    });

    nsSocket.on('timer', (data) => {
        $('.time').text(data);
    })
}