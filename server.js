//creates a server
const express = require('express')
const { ExpressPeerServer } = require('peer')
const app = express()
const server = require('http').Server(app)
const io = require('socket.io')(server)

//generates id
const { v4: uuidV4 } = require('uuid')

const peerServer = ExpressPeerServer(server, {
    path: '/'
})

app.set('port', (process.env.PORT || 3000));
app.set('view engine', 'ejs')
app.use(express.static('public'))
app.use('/peerjs', peerServer)

//gets request and response
app.get('/', (req, res) => {
    res.redirect(`/${uuidV4()}`)
}).listen(app.get('port'), () => {
    console.log('App is running, server is listening on port ', app.get('port'));
})

//directs user to the room
app.get('/:room', (req, res) =>{
    res.render('room', { roomId: req.params.room })
})

//when someone connects to the server
io.on('connection', socket => {
    //when someone connects to a room
    socket.on('join-room', (roomId, userId) => {
        socket.join(roomId)
        //tells people in the room of a user connection into their room
        socket.broadcast.to(roomId).emit('user-connected', userId, roomId)
        //when someone disconnects from the server
        socket.on('disconnect', () => {
            socket.broadcast.to(roomId).emit('user-disconnected', userId, roomId)
        })
        //prints out the roomId and the userId
        //console.log(roomId, userId)
    })
})

server.listen(3000)