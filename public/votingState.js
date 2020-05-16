function votingState(){

    nsSocket.on('gameStateVote', (data) => {
        $('#gameWindow').empty();
        $('#gameWindow').append(data.html);

        let gifs = data.gifs;
        
        nsSocket.emit('getUser');
        nsSocket.on('userName', (user) => {
            gifs.forEach((content) => {
                if(content.username !== user.username){
                    let newImg = `<div class="gifDiv"> <img src=${content.selection} class="votingGif" data=${content.username}></div>`
                    $('#gif-container').append(newImg);
                    $(document).on('click', '.votingGif', (event) => {
                        let vote = $(event.target).attr('data')
                        nsSocket.emit('gifSelected', vote);
                    });
                }
            });
            gifs.length = 0;
        });
       
    });

    nsSocket.on('timer', (data) => {
        $('.time').text(data);
    });
}