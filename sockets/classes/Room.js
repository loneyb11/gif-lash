class Room{
    constructor(namespace)
    {
        this.roomTitle = 'lobby';
        this.namespace = namespace;
        this.history = [];
    }

    addMessage(msg){
        this.history.push(msg);
    }
    clearHistory(){
        this.history = [];
    }
}

module.exports = Room