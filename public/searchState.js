function searchState()
{
    nsSocket.on('timer', (data) => {
        console.log(data);
    });
    nsSocket.on('gameStateSearch', (data) => {
        $('#gameWindow').empty();
        $('#gameWindow').append(data.html);
        $('#search-box').submit((event) => {searchGif(event)})
        $('.announcer-text').text(data.question)
    });
    nsSocket.on('timer', (data) => {
        $('.time').text(data);
    })

    function searchGif(event)
    {
        
    event.preventDefault();
    const gifContainer = $("#gif-container");
    gifContainer.empty();
    const gifKeyword = $("input.searchInput");
    const queryURL = `https://api.giphy.com/v1/gifs/search?q=${gifKeyword.val().trim()}&api_key=PgqiZ72BDLSFVrW4QL7p7F3gUgiXSbLo`;
    $.ajax({
      url: queryURL,
      method: "GET"
    }).then((response) => {
        const randomArray = [];
        // pushes 5 random numbers between 0 and 24 to an array
        while (randomArray.length < 5) {
            const x = Math.floor(Math.random() * 25);
            if (!randomArray.includes(x)) {
            randomArray.push(x);
            }
        }
        for (let i = 0; i < 5; i += 1) {
            const newGif = $("<img>").addClass("image");
            const gifUrl = response.data[randomArray[i]].images.fixed_height.url;
            newGif.attr("src", gifUrl) ;
            newGif.on("click", selectGif);
            gifContainer.append(newGif);
        }
        function selectGif() {
             let selected = $(this).attr("src")
            nsSocket.emit('gifSelected', selected);
        };
    });
        
    };
}
