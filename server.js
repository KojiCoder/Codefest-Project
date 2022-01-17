//creates server
const express = require('express')
const app = express()
const server = require('http').Server(app)
const socket = require('socket.io')
const io = socket(server)
const {ExpressPeerServer} = require('peer');

//generates id
const { v4: uuidV4 } = require('uuid')

const peerServer = ExpressPeerServer(server, {
    debug: true
})

app.set('port', (process.env.PORT || 3000));
app.set('view engine', 'ejs')
app.use('/peerjs', peerServer)
app.use(express.static('public'))

//when entering the default, generate a roomid randomly direct it to the new room
app.get('/', (req, res) => {
    res.redirect(`/${uuidV4()}`)
})

//directly connects to the room
app.get('/:room', (req, res) =>{
    res.render('room', { roomId: req.params.room })
})

//when someone connects to the server
io.on('connection', socket => {
    //when someone connects to a room
    socket.on('join-room', (roomId, userId) => {
        socket.join(roomId)
        //run this event when user connects to a room
        socket.broadcast.to(roomId).emit('user-connected', userId, roomId)
        //run this event when user disconnects from a room
        socket.on('disconnect', () => {
            socket.broadcast.to(roomId).emit('user-disconnected', userId, roomId)
        })
        //prints out the roomId and the userId
        //console.log(roomId, userId)
    })
})

server.listen(process.env.PORT || 3000)