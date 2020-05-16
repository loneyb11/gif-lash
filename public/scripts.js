/* eslint-disable no-undef */
const socket = io('https://gif-lash.herokuapp.com/', { timeout: 2000 });


// const socket = io('http://localhost:3000');
let nsSocket = "";
socket.on('welcomeMessage', (data) => {
    $('#main-window').append(data.html);
    $('.welcome-lobby-text').text(data.text);
});

socket.on('newNsList', (data) => {
    $('.table tbody').empty();
    $('.table tbody').append(data.html);
});

$(document).on('click','.namespace', function (event){
   joinNs($(this).attr('data'));
});

$(document).on('click','.create-game', () => {
    $('#server-table-container').hide();
    $('#form-container').show();
});

$(document).on('click','.join-game', () => {
    $('#form-container').hide();
    $('#server-table-container').show();
    socket.emit('getNsList');
});

$(document).on('submit','#form-container', function (event){
    
    event.preventDefault();

    let $inputs = $('form :input');
    let values = [];
    let validated = true;
    $inputs.each(function () {
            values.push({[this.name]: $(this).val()})
    });
    values.pop(7);
    values.forEach((val) => {
        if(Object.values(val)[0] === "")
        {
            validated = false;
            $(`#${Object.keys(val)[0]}`).css('display', 'inline-block');
            $(`#${Object.keys(val)[0]}`).show();
        }
        else{
            $(`#${Object.keys(val)[0]}`).hide();
        }
    });
    if(validated === true)
    {
        socket.emit('createServer', {settings: values});
    }
});

