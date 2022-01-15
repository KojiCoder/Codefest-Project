const socket = io('/')
const videoGrid = document.getElementById('video-grid')
const myVideo = document.createElement('video')
const peers = {}

var myPeer = new Peer(undefined, {
    secure: true,
    host: '/',
    path: '/peerjs',
    port: '443'
    //host: 'https://codefest-project-wip.herokuapp.com',
})

let myVideoStream

//mute video so that we don't have to hear ourselves
myVideo.muted = true

//makes call when a new user connects to room
const connectToNewUser = (userId, stream) => {
    const call = myPeer.call(userId, stream)
    const video = document.createElement('video')
    call.on('stream', userVideoStream => {
        addVideoStream(video, userVideoStream)
    })
    call.on('close', () => {
        video.remove()
    })

    peers[userId] = call
}

//load the video onto the site and play it
const addVideoStream = (video, stream) => {
    video.srcObject = stream
    video.addEventListener('loadedmetadata', () => {
        video.play()
    })
    videoGrid.append(video)
}

//sends video and audio to other people in the room
navigator.mediaDevices.getUserMedia({
    video: true,
    audio: true
}).then(stream => {
    myVideoStream = stream;
    addVideoStream(myVideo, stream)
    //receive calls
    myPeer.on('call', call => {
        call.answer(stream)
        const video = document.createElement('video')
        call.on('stream', userVideoStream => {
            addVideoStream(video, userVideoStream)
        })
    })
    socket.on('user-connected', (userId, roomId) =>{
        connectToNewUser(userId, stream)
        console.log('User connected: ' + userId + ' to ' + roomId)
    })
})

myPeer.on('open', id => {
    socket.emit('join-room', ROOM_ID, id)
})

socket.on('user-disconnected', (userId, roomId) => {
    if (peers[userId]){
        peers[userId].close()
    }
    console.log('User disconnected: ' + userId + ' from ' + roomId)
})