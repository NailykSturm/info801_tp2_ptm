import { io, Socket } from 'socket.io-client';

import { CHANNEL_CLOCK, CHANNEL_SEND_TMP, CHANNEL_OFF_CHAUD, CHANNEL_ON_CHAUD, CHANNEL_RAPPORT_CHAUD, CHANNEL_START_CHAUD, CHANNEL_STATE_CHAUD } from '@/socket_channel';
import { env_temp, temp_ref, crtl_mode, plage, daytime, clockInterval, lunchReport } from '@/store/env_store';
import {STATE_UNKNOWN} from './chaudiere';

let socket: Socket | null = null;
export const MODE_REGULE = "régulé";
export const MODE_PROGRAMME = "programmé";

let chaudiere_state: string = STATE_UNKNOWN;
let canHaveReport: boolean = true;

function init(cbSucess: (res: string) => void, cbError: (err: string) => void) {
    if (socket) return;
    socket = io(process.env.VUE_APP_SOCKET_URI || "localhost:3000", { transports: ['websocket'], reconnectionDelay: 2000 });
    socket.on('connect', () => { cbSucess('socket controller connected'); });

    socket.on(CHANNEL_STATE_CHAUD, (state: string) => { chaudiere_state = state; });
    socket.on(CHANNEL_START_CHAUD, () => {
        // canHaveReport = true;
        setTimeout(() => {
            canHaveReport = false
            gestionStart();
        }, 10 * 1000);
    });
    socket.on(CHANNEL_RAPPORT_CHAUD, (rapport: string) => {
        if (canHaveReport) {
            gestionStart(rapport);
        }
    });
    socket.on(CHANNEL_CLOCK, (time: number) => {
        if (chaudiere_state == STATE_UNKNOWN || !chaudiere_state) {
            socket?.emit(CHANNEL_START_CHAUD);
            return;
        } 
        const clockTime = time % daytime.value;
        if (crtl_mode.value === MODE_REGULE) {
            if (env_temp.value >= temp_ref.value + 2) {
                socket?.emit(CHANNEL_OFF_CHAUD);
            } else if (env_temp.value <= temp_ref.value - 2) {
                socket?.emit(CHANNEL_ON_CHAUD);
            }
        } else {
            if (inTimeWork(clockTime))
                socket?.emit(CHANNEL_ON_CHAUD);
             else socket?.emit(CHANNEL_OFF_CHAUD);
        }
    });
    socket.on(CHANNEL_SEND_TMP, (temp: number) => { env_temp.value = temp });
}

function inTimeWork(time: number): boolean {
    return plage.value.start < plage.value.end ? plage.value.start <= time && time <= plage.value.end : !(plage.value.start >= time && time >= plage.value.end);
}

function gestionStart(rapport: string | undefined = undefined) {
    if (rapport) {
        console.log(rapport)
        lunchReport.value = rapport;
    } else {
        if (chaudiere_state === STATE_UNKNOWN){
            console.log("problème de communication avec la chaudière")
            lunchReport.value = "Problème de communication avec la chaudière";
        }
        // else
            // lunchReport.value = "Chaudière démarrée";

    }
}

export default init;