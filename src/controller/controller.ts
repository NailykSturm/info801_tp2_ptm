import { io, Socket } from 'socket.io-client';

import { CHANNEL_CLOCK, CHANNEL_SEND_TMP, CHANNEL_ASK_STATE_CHAUD, CHANNEL_OFF_CHAUD, CHANNEL_ON_CHAUD, CHANNEL_RAPPORT_CHAUD, CHANNEL_START_CHAUD, CHANNEL_STATE_CHAUD } from '../socket_channel';
import { env_temp, temp_ref, crtl_mode, plage, daytime, clockInterval, lunchReport } from '../store/env_store';
import { STATE_DESACTIVE, STATE_UNKNOWN } from './chaudiere';

let socket: Socket | null = null;
export const MODE_REGULE = "regule";
export const MODE_PROGRAMME = "programme";

let chaudiere_state = STATE_UNKNOWN;
let canHaveReport = true;

function init(cbSucess: (res: string) => void, cbError: (err: string) => void) {
    if (socket) return;
    socket = io(process.env.VUE_APP_SOCKET_URI || "localhost:3000", { transports: ['websocket'], reconnectionDelay: 2000 });
    socket.on('connect', () => { cbSucess('socket controller connected'); });

    socket.on(CHANNEL_STATE_CHAUD, (state: string) => { chaudiere_state = state; });
    socket.on(CHANNEL_START_CHAUD, () => {
        setTimeout(() => {
            canHaveReport = false
            gestionStart();
        }, clockInterval.value * 10);
    });
    socket.on(CHANNEL_RAPPORT_CHAUD, (rapport: string) => {
        if (canHaveReport) {
            gestionStart(rapport);
        }
    });
    socket.on(CHANNEL_CLOCK, (time: number) => {
        const clockTime = time % daytime.value;
        if (crtl_mode.value === MODE_REGULE) {
            if (env_temp.value > temp_ref.value + 2) {
                socket?.emit(CHANNEL_OFF_CHAUD);
            } else if (env_temp.value < temp_ref.value - 2) {
                socket?.emit(CHANNEL_ON_CHAUD);
            }
        } else {
            if (plage.value.start < clockTime && clockTime > plage.value.end) {
                if (chaudiere_state !== STATE_DESACTIVE)
                    socket?.emit(CHANNEL_OFF_CHAUD);
            } else if (plage.value.start > clockTime && clockTime < plage.value.end) {
                if (chaudiere_state === STATE_DESACTIVE)
                    socket?.emit(CHANNEL_ON_CHAUD);
            }
        }
    });
    socket.on(CHANNEL_SEND_TMP, (temp: number) => { env_temp.value = temp });
}

function gestionStart(rapport: string | undefined = undefined) {
    if (rapport) {
        console.log(rapport)
        lunchReport.value = rapport;
    } else {
        if (chaudiere_state === STATE_UNKNOWN)
            lunchReport.value = "Problème de communication avec la chaudière";
        else
            console.log("Chaudière démarrée");
    }
}

export default init;