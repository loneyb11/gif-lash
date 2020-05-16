class Namespace{
    constructor(nsTitle, maxClientCnt, roundCnt, voteTime, searchTime, rating, password, host)
    {
        this.nsTitle = nsTitle;
        this.endpoint = `/${nsTitle}`;
        this.maxClientCnt = maxClientCnt;
        this.roundCnt = roundCnt;
        this.voteTime = voteTime;
        this.searchTime = searchTime;
        this.rating = rating;
        this.room = [];
        this.password = password;
        this.host = host;
    }

    addRoom(roomObj){
        this.room.push(roomObj);
    }
}

module.exports = Namespace;