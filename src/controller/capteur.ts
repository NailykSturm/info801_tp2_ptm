import { io } from 'socket.io-client';

import { CHANNEL_CLOCK, CHANNEL_SEND_TMP, CHANNEL_STATE_CHAUD } from '../socket_channel';
import { env_temp } from '../store/env_store';
import { STATE_DESACTIVE } from './chaudiere';

let socket: any | null = null

function init(cbSucess: any, cbError: any) {
    if (socket) return;
    socket = io(process.env.VUE_APP_SOCKET_URI || "localhost:3000", {
        autoConnect: true,
        reconnection: false,
        transports: ['websocket'],
    });

    socket.on('connect', () => { cbSucess('socket capteur connected'); });

    socket.on(CHANNEL_STATE_CHAUD, (state: string) => {
        chaudiere_status = state;
    });
    socket.on(CHANNEL_CLOCK, () => {
        socket.emit(CHANNEL_SEND_TMP, env_temp.value);
        if (chaudiere_status === STATE_DESACTIVE) {
            env_temp.value = env_temp.value - Math.random() * 0.5 - 0.25;
        } else {
            env_temp.value = env_temp.value + Math.random() * 0.5 - 0.25 + 0.5;
        }
    });
}

let chaudiere_status = STATE_DESACTIVE;

export default init;