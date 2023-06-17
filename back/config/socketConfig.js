require('dotenv').config()

const io = require('socket.io')(process.env.PORT_SOCKET, {
    cors: {
        origin: ["http://localhost:5173", "http://192.168.1.10:5173"],
        methods: ["GET", "POST"]
    }
});


const initSocketServer = () => {
    try {
        io.on('connection', (socket) => {
            // console.log({ message: 'connection ios ok' })
            socket.isAlive = true;

            socket.on('newComment', (comment) => {
                // console.log('un commentaire est arrivé:', (comment))
                io.emit('renderComment', comment)
            })

            socket.on("disconnect", (reason) =>{
                console.log('socket out:', reason)
            })

            // console.log([...io.sockets.sockets.values()])

            // const interval = setInterval(() => {
            //     [...io.sockets.sockets.values()].forEach((socket) => {
            //         console.log(socket.isAlive)
            //         console.log('2')
            //         if (!socket.isAlive) {
            //             console.log('socket is not active')
            //             //disconnect clients who doesn't answer to ping
            //             return socket.disconnect(true);
            //         }
            //         //set all clients isAlive to false and emit a ping
            //         console.log(socket, 'is active')
            //         socket.isAlive = false;
            //         socket.emit('ping');
            //         console.log('3')
            //     });
            // }, 10000);

            // socket.on('pong', (msg) => {
            //     console.log('pong:', msg);
            //     //if client answer to ping, set isAlive to true
            //     socket.isAlive = true;          
            //     //we receive pong, the co still active
            // })
        })
    } catch (error) {
        console.log(error)
    }
};

initSocketServer();

