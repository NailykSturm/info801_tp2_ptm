import { Socket, io } from 'socket.io-client';
import { ref, watch } from 'vue';

import { CHANNEL_ASK_STATE_CHAUD, CHANNEL_START_CHAUD, CHANNEL_STATE_CHAUD, CHANNEL_OFF_CHAUD, CHANNEL_ON_CHAUD, CHANNEL_RAPPORT_CHAUD } from '@/socket_channel'
import { disjoncteur, proba_panne, proba_err_comm } from '@/store/env_store';

let socket: Socket | null = null;

export const STATE_ACTIVE = 'active';
export const STATE_DESACTIVE = 'desactive';
export const STATE_UNKNOWN = 'unknown';
const state = ref(STATE_DESACTIVE);
const canUse = ref(false);

function init(cbSucess: (res: string) => void, cbError: (err: string) => void) {
    if (socket) return;
    socket = io(process.env.VUE_APP_SOCKET_URI || "localhost:3000", { transports: ['websocket'], reconnectionDelay: 2000 });
    socket.on('connect', () => { cbSucess('socket chaudiere connected'); });
    socket.on(CHANNEL_ASK_STATE_CHAUD, () => { if (disjoncteur.value) socket?.emit(CHANNEL_STATE_CHAUD, state.value) });
    socket.on(CHANNEL_ON_CHAUD, () => {
        if (!disjoncteur.value) return;
        if (!canUse.value) return;
        state.value = STATE_ACTIVE;
        socket?.emit(CHANNEL_ASK_STATE_CHAUD);
    });
    socket.on(CHANNEL_OFF_CHAUD, () => {
        if (!disjoncteur.value) return;
        if (!canUse.value) return;
        state.value = STATE_DESACTIVE;
        socket?.emit(CHANNEL_ASK_STATE_CHAUD);
    });
    socket.on(CHANNEL_START_CHAUD, () => {
        if (!disjoncteur.value) {
            return;
        } else {
            if (Math.random() <= proba_panne.value / 100) {
                if (Math.random() <= proba_err_comm.value / 100) {
                    socket?.emit(CHANNEL_RAPPORT_CHAUD, `Panne de la chaudière : Erreur n° ${Math.floor(Math.random() * 10)}`);
                }
                canUse.value = false;
                return;
            }
            canUse.value = true;
            state.value = STATE_ACTIVE;
            socket?.emit(CHANNEL_ASK_STATE_CHAUD);
        }
    });
    watch(disjoncteur, (val) => {
        if (!val) {
            state.value = STATE_DESACTIVE;
            socket?.emit(CHANNEL_STATE_CHAUD, STATE_UNKNOWN);
        }
    });
}

export default init;