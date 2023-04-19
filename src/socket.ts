import { Server } from 'socket.io';

const io = new Server(parseInt(process.env.SOCKET_PORT || "3000"), { cors: { origin: "http://localhost:8080" } });
io.on('connection', (socket) => {
    console.log(`New client connected ${socket.id}`);
    socket.on('disconnect', () => { console.log(`Client disconnected ${socket.id}`) });
});