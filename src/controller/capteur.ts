import { io, Socket } from 'socket.io-client';

import { CHANNEL_CLOCK, CHANNEL_SEND_TMP, CHANNEL_STATE_CHAUD } from '../socket_channel';
import { env_temp } from '../store/env_store';
import { STATE_DESACTIVE } from './chaudiere';

let socket: Socket | null = null

function init(cbSucess: (res: string) => void, cbError: (err: string) => void) {
    if (socket) return;
    socket = io(process.env.VUE_APP_SOCKET_URI || "localhost:3000", { reconnectionDelay: 2000, transports: ['websocket'], });

    socket.on('connect', () => { cbSucess('socket capteur connected'); });

    socket.on(CHANNEL_STATE_CHAUD, (state: string) => {
        chaudiere_status = state;
    });
    socket.on(CHANNEL_CLOCK, () => {
        if (!socket) return;
        socket.emit(CHANNEL_SEND_TMP, env_temp.value);
        if (chaudiere_status === STATE_DESACTIVE) {
            env_temp.value = env_temp.value - parseInt((Math.random() * 0.5).toFixed(2));
        } else {
            env_temp.value = env_temp.value + parseInt((Math.random() * 0.5).toFixed(2));
        }
    });
}

let chaudiere_status = STATE_DESACTIVE;

export default init;