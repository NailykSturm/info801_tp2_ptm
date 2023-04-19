import { io } from 'socket.io-client';

import { CHANNEL_ASK_STATE_CHAUD, CHANNEL_START_CHAUD, CHANNEL_STATE_CHAUD, CHANNEL_OFF_CHAUD, CHANNEL_ON_CHAUD, CHANNEL_RAPPORT_CHAUD } from '../socket_channel'
import { disjoncteur, proba_panne } from '../store/env_store';

let socket: any | null = null;

export const STATE_ACTIVE = 'active';
export const STATE_DESACTIVE = 'desactive';
export const STATE_UNKNOWN = 'unknown';
let state = STATE_DESACTIVE;

function init(cbSucess: any, cbError: any) {
    if (socket) return;
    socket = io(process.env.VUE_APP_SOCKET_URI || "localhost:3000", {
        autoConnect: true,
        reconnection: false,
        transports: ['websocket'],
    });
    socket.on('connect', () => { console.log('socket chaudiere connected'); });
    socket.on(CHANNEL_ASK_STATE_CHAUD, () => { socket.emit(CHANNEL_STATE_CHAUD, state) });
    socket.on(CHANNEL_ON_CHAUD, () => {
        state = STATE_ACTIVE;
        socket.emit(CHANNEL_ASK_STATE_CHAUD);
    });
    socket.on(CHANNEL_OFF_CHAUD, () => {
        state = STATE_DESACTIVE;
        socket.emit(CHANNEL_ASK_STATE_CHAUD);
    });
    socket.on(CHANNEL_START_CHAUD, () => {
        if (!disjoncteur.value) {
            return;
        } else {
            if (Math.random() < proba_panne.value) {
                if (Math.random() <= 0.666) {
                    socket.emit(CHANNEL_RAPPORT_CHAUD, `Panne de la chaudière : Erreur n° ${Math.floor(Math.random() * 1000)}`);
                }
                return;
            }
            state = STATE_ACTIVE;
            socket.emit(CHANNEL_ASK_STATE_CHAUD);
        }
    });
}

export default init;