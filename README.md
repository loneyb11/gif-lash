# Project-2
Gif-Lash

This browser based game will host up to _# users in a room to play a humorous party game.
Users scores for this game will be posted to a database table along with their username.

On loading the page, users will be presented with a login screen asking for a username.
-If the username is not already in the database's user table, a row will be craeted for them with a score of 0
-If the username is already in the table, they will add to their old score.

Once users have logged in the page will do a ready check, once all or most of the players are ready, the game starts. 

The page will show a question or phrase and the users must respond with a funny gif.
-There will be a search bar that queries the giphy API and returns a few gifs to choose from based on the query.
-Players choose a give and hit a submit button then wait for the next phase.
-A timer will count down from 30 seconds before automatically moving on.

In this phase, all the player's gifs are shown anonymously, and players vote on their favourites.
-Whoever gets the most votes after everyone submits gets a point
-A timer will count down from 30 seconds before automatically moving on.

The game then shows another question or phrase, and loops for _# rounds
