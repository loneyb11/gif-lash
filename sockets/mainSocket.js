
const Namespace = require('./classes/Namespace.js');
const Room = require('./classes/Room.js');
const GameHandler = require('./classes/GameHandler.js')

const fs = require('fs');
const mainLobbyHTML = fs.readFileSync("./views/game-partials/main_lobby.html", "utf8")


function mainSocket(io){

    let namespaces = [];

    io.on('connection', (socket) => {
        
        let username;

        if (socket.request.session.passport) {
            username = socket.request.session.passport.user;
            console.log(`${username} has connected`);
            socket.emit('welcomeMessage', {text: `Welcome ${username}!`, html: mainLobbyHTML});
          }
          else {
            socket.emit('redirect', { url: 'http://localhost:3000/auth/logout' });
          }

        socket.on('createServer', (data) => {
         if(validateSettings(data))
          {
              
            let title = data.settings[0].serverName;
            let password = data.settings[1].password;
            let playerCount = data.settings[2].playerCount;
            let roundNumber = data.settings[3].roundNumber;
            let searchTimer = data.settings[4].searchTimer;
            let voteTimer = data.settings[5].voteTimer;
            let rating = data.settings[6].questionType;

            const newNamespace = new Namespace(title, playerCount, roundNumber, voteTimer, searchTimer, rating, password, username);
            newNamespace.addRoom(new Room(newNamespace));

            const newGameHandler = new GameHandler(io, newNamespace);
            
            if(namespaces.length === 0 && username !==undefined){
                namespaces.push(newNamespace);
                newGameHandler.initLobby();
            }
            else{
                namespaces.forEach((namespace) => {
                    if(namespace.host.indexOf(username) === -1 && username !==undefined)
                    {
                        namespaces.push(newNamespace);
                        newGameHandler.initLobby();
                    }
                    else{
                        //todo handle case for already existing namespace
                    }
                  });
            }
          }
          else if(!validateSettings(data))
          {
            //todo handle case for failed validation
          }
        
        });
        socket.on('getNsList', () => {
           let tableHtml = [];
            namespaces.forEach((namespace) => {
                io.of(namespace.endpoint).clients((err, clients) => {
                    let tr = ` 
                    <tr class="namespace" data=${namespace.endpoint}>
                    <td>${namespace.nsTitle}</td>
                    <td>${clients.length}/${namespace.maxClientCnt}</td>
                    <td>${namespace.rating}</td>
                    </tr>`
                    tableHtml.push(tr);
                    if(tableHtml.length === namespaces.length){
                        socket.emit('newNsList', {html: tableHtml})
                    } 
                 })
            });
        });

        socket.on('closeNs', (data) => {
                namespaces.forEach((namespace, indx) => {
                    if(namespace.endpoint === data.endpoint)
                    {
                        namespaces.splice(indx);
                    }
                });
        });
    });

}

function validateSettings(data){
    //check for setting length to be number of inputs on form ✓
    //check if the setting is not empty, null or undefined ✓
    //todo create more server validation for settings X
    let requiredSettingLength = 7;
    let cb = (msg, isValid) =>{
        console.log(msg)
        return isValid
    }
    if(data.settings === undefined)
    {

        return cb('data.settings is undefined', false);

    }
    if(data.settings.length !== requiredSettingLength)
    {
        return cb(`data.settings length is less than ${requiredSettingLength}`, false);
    }
    data.settings.forEach((setting) => {
        let settingValue = Object.values(setting)[0];
        if(settingValue === "" || settingValue === null || settingValue === undefined)
        {
            return cb(`${settingValue} error check if '', null or undefined`, false);
        }
    });

    return true;
}
module.exports = mainSocket;