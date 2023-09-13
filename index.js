const express = require('express');
const app = express();
const http = require('http');
const {Server} = require('socket.io');
const cors = require('cors');

app.use(cors());

const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: "http://localhost:3000",
        methods: ["GET", "POST"],
    },
});

var numClients = {};

io.on('connection', (socket) => {


  console.log('a user connected');
  console.log('id: ' + socket.id);

  //user joins a room
  socket.on('join_room', (data) => {
    console.log('room joined: ' + data.room);
    console.log(numClients);
    //room create
    if ((numClients[data.room] === undefined) || (numClients[data.room] === 0)) {
      socket.join(data.room);
      socket.room = data.room;
      numClients[data.room] = 1;
      console.log('first player join room! : ' + data.room)
      socket.emit('1stPlayer', {room: data.room}); //will set first player to X
    }

    //room full
    else if(numClients[data.room] === 2){
      socket.emit('no_space');
    }

    //room alr has 1 person
    else {
      socket.to(data.room).emit("2ndPlayer_joined", {room: data.room});

      socket.join(data.room);
      socket.room = data.room;
      numClients[data.room]++;
      socket.emit('2ndPlayer', {room: data.room});  //will set second player to O

    }

  })

  socket.on('move_made', (data) => {
    console.log("move done: " + data.string + " in room: " + socket.room + " winner: " + data.winner + " xPts: " + data.xPts + " oPts: " + data.oPts);
    socket.to(socket.room).emit('move_made_server', {string: data.string, winner: data.winner, xPts: data.xPts, oPts: data.oPts});
  })

  socket.on('disconnect', function () {
    numClients[socket.room]--;
  });
  
});


server.listen(3002, () => {
  console.log('server running on port 3002 !');
});