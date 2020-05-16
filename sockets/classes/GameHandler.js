const fs = require('fs');
const gameQuestions = require('../data/gameQuestions.js');

const player_lobbyHTML = fs.readFileSync("./views/game-partials/player_lobby.html", "utf8")
const main_lobbyHTML = fs.readFileSync("./views/game-partials/main_lobby.html", "utf8")
const searchHTML = fs.readFileSync("./views/game-partials/search.html", "utf8")
const votingHTML = fs.readFileSync("./views/game-partials/vote.html", "utf8")
const outcomeHTML = fs.readFileSync("./views/game-partials/outcome.html", "utf8")
const fianlScoreHTML = fs.readFileSync("./views/game-partials/final_score.html", "utf8")

class GameHandler
{
    constructor(io, ns)
    {
        this.io = io;
        this.ns = ns;
        this.searchTimer;
        this.voteTimer;
        this.outcomeTimer;
        this.searchTimeReset = ns.searchTime;
        this.voteTimeReset = ns.voteTime;
        this.outcomeTimeRest = 10;
        this.searchTime = ns.searchTime;
        this.voteTime = ns.voteTime;
        this.outcomeTime = 10;
        this.roundCnt = ns.roundCnt;
        this.questionHistory = [];
        this.votingArr = [];
        this.players = [];
        this.room = this.ns.room[0].roomTitle;
        this.playersReady = false;
        this.startRound = this.startRound.bind(this);
        this.calculateWinner = this.calculateWinner.bind(this);
        this.generateQuestion = this.generateQuestion.bind(this);
    }
    initLobby()
    {
        this.io.of(this.ns.endpoint).on('connection', (nsSocket => {
            let player;

            if(nsSocket.request.session.passport !== undefined)
            {
                
                player = {username: nsSocket.request.session.passport.user,
                    score: 0
                }
            }
            if(this.players.length !== this.ns.maxClientCnt)
            {
                if(this.players.indexOf(player) === -1){
                    this.players.push(player);
                }
                //todo change player readyup to not req all players and add ready btn back
                //<button type="button" class="btn btn-success ready-up">Ready!</button>
                this.io.of(this.ns.endpoint).clients((err, clients) => {

                    nsSocket.join(this.room);

                    nsSocket.emit('initGame', {html: player_lobbyHTML, text: `Waiting for ${clients.length}/${this.ns.maxClientCnt} players`});
                    nsSocket.emit('historyCatchUp', {messages: this.ns.room[0].history});
                    if(parseInt(this.ns.maxClientCnt) === parseInt(clients.length)){
                        this.roundCnt -= 1;
                        this.startRound();
                    }
                })
    
            }
            else if(this.players.indexOf(player) === 0){
                nsSocket.emit('redirect', {html: main_lobbyHTML, text: `Welcome back!`});
            }
            nsSocket.on('getUser', () => {
                nsSocket.emit('userName', {username: nsSocket.request.session.passport.user})
             });
            nsSocket.on('gifSelected', (selected) => {
                let playerSelection = {
                  username: nsSocket.request.session.passport.user,
                  selection: selected
                };
                if(this.votingArr.findIndex(i => i.username === playerSelection.username) === -1)
                {
                  this.votingArr.push(playerSelection);
                }
                else{
                  this.votingArr.forEach((player) => {
                    if(player.username === playerSelection.username)
                    {
                      player.selection = selected;
                    }
                  });
                }
              });
              nsSocket.on('newMessageToServer', (msg) => {
                const fullMsg = {
                    username: nsSocket.request.session.passport.user,
                    text: msg.text, 
                }
                this.ns.room[0].addMessage(fullMsg);
                console.log(fullMsg);
                this.io.of(this.ns.endpoint).to(this.room).emit('messageToClients', {message: fullMsg});
              });
          
        }));
    }

   
    startRound(){

        this.searchTime = this.searchTimeReset;
        this.voteTime = this.voteTimeReset;
        this.outcomeTime = this.outcomeTimeRest;
        this.votingArr.length = 0;

        let questionText = this.generateQuestion();

        this.io.of(this.ns.endpoint).emit('gameStateSearch', {question: questionText, html: searchHTML});

        let countDownOutcome = () => { 
            this.outcomeTime -=1;
      
            this.io.of(this.ns.endpoint).emit('timer', this.outcomeTime);
            if(this.outcomeTime === 0 && this.roundCnt > 0)
            {
              this.roundCnt -= 1;
              clearInterval(this.outcomeTimer);
              this.startRound();
            }
            else if(this.roundCnt <= 0){
                let finalscores = this.players.map((player) => {
                    return player.score
                });
                let topScore = Math.max(...finalscores);
                let finalWinner = [];
                this.players.forEach((player) => {
                    if(player.score === topScore){
                        finalWinner.push(player.username);
                    }
                });
                let announcerTxt = 'Game Over! This game goes to ' + finalWinner + '!';
                clearInterval(this.outcomeTimer);
                this.io.of(this.ns.endpoint).emit('gameStateOutcome', {html: fianlScoreHTML, text: announcerTxt});
                setTimeout(() => {
                    this.io.of(this.ns.endpoint).emit('closeGame', {html: main_lobbyHTML, text: `Welcome back!`, endpoint: this.ns.endpoint});
                 }, 10000);
  
            }
          }

        let countDownVote = () => { 
            this.voteTime -=1;
      
            this.io.of(this.ns.endpoint).emit('timer', this.voteTime);
      
            if(this.voteTime === 0)
            {
              let winner = this.calculateWinner();
              let announcerTxt = `This round goes to ${winner}!` 
              this.io.of(this.ns.endpoint).emit('gameStateOutcome', {html: outcomeHTML, text: announcerTxt});
              clearInterval(this.voteTimer);
              this.outcomeTimer = setInterval(countDownOutcome, 1000)
            }
          }

        let countDownSearch  = () => {
          this.searchTime -= 1;
          this.io.of(this.ns.endpoint).emit('timer', this.searchTime);
    
          if(this.searchTime === 0)
          {
            this.io.of(this.ns.endpoint).emit('gameStateVote', {gifs: this.votingArr, html: votingHTML});
            this.votingArr.length = 0;
            clearInterval(this.searchTimer);
            this.voteTimer = setInterval(countDownVote, 1000)
          }
        }

        this.searchTimer = setInterval(countDownSearch, 1000);

       
    }

    calculateWinner(){
        let users = [];
        let votes = [];
        let winner = [];
        this.votingArr.forEach((voter) => {
            let user = {
                username: voter.username,
                score: 0,
            }
            users.push(user)
            votes.push(voter.selection)
        })
        votes.forEach((vote) => {
            for(let i = 0; i < users.length; i++)
            {
                if(vote === users[i].username)
                {
                    users[i].score += 1;
                }
            }
       });
       let scores = users.map((player) => {
           return player.score
       });
       let maxScore = Math.max(...scores)

       users.forEach((player) => {
            if(player.score === maxScore){
                winner.push(player.username);
            }
       });
       this.players.forEach((player) => {
           for(let m = 0; m < winner.length; m++){
            if(player.username === winner[m])
            {
                 player.score += 1;
            }
           }
       });
       return winner;
    }

  generateQuestion()
  {
    let generatedIndex = Math.floor(Math.random() * gameQuestions.length)
    let generatedQuestion = gameQuestions[generatedIndex];
    if(this.questionHistory.indexOf(generatedQuestion) === -1){
      this.questionHistory.push(generatedQuestion)
      return generatedQuestion.question;
    }
    else if(this.questionHistory.length != gameQuestions.length){
      this.generateQuestion();
    } 
    else
    {
      return 'Out of questions!'
    }
  }

}

module.exports = GameHandler