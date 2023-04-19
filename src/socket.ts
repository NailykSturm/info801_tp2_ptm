import { Server, Socket } from 'socket.io';
import * as chan from './socket_channel';

const io = new Server(parseInt(process.env.SOCKET_PORT || "3000"), { cors: { origin: "http://localhost:8080" } });
let sessions: Socket[] = [];
io.on('connection', (socket) => {
    sessions.push(socket);
    // console.log(`New client:   ${socket.id} | Number of clients: ${sessions.length}`);
    socket.on('disconnect', () => { 
        sessions = sessions.splice(sessions.indexOf(socket), 1);
        // console.log(`Suppr client: ${socket.id} | Number of clients: ${sessions.length}`);
    });
    socket.on(chan.CHANNEL_ASK_STATE_CHAUD, (data: any) => { broadcast(chan.CHANNEL_ASK_STATE_CHAUD, data); });
    socket.on(chan.CHANNEL_CLOCK, (data: any) => { broadcast(chan.CHANNEL_CLOCK, data); });
    socket.on(chan.CHANNEL_OFF_CHAUD, (data: any) => { broadcast(chan.CHANNEL_OFF_CHAUD, data); });
    socket.on(chan.CHANNEL_ON_CHAUD, (data: any) => { broadcast(chan.CHANNEL_ON_CHAUD, data); });
    socket.on(chan.CHANNEL_RAPPORT_CHAUD, (data: any) => { broadcast(chan.CHANNEL_RAPPORT_CHAUD, data); });
    socket.on(chan.CHANNEL_SEND_TMP, (data: any) => { broadcast(chan.CHANNEL_SEND_TMP, data); });
    socket.on(chan.CHANNEL_START_CHAUD, (data: any) => { broadcast(chan.CHANNEL_START_CHAUD, data); });
    socket.on(chan.CHANNEL_STATE_CHAUD, (data: any) => { broadcast(chan.CHANNEL_STATE_CHAUD, data); });
});

function broadcast(channel: string, data: any) {
    sessions.forEach((socket) => {
        socket.emit(channel, data);
    });
}