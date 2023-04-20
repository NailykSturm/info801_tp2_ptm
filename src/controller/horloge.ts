import { io, Socket } from "socket.io-client";

import { clockInterval, simulPause } from "@/store/env_store";
import { CHANNEL_CLOCK } from "@/socket_channel";

let socket: Socket | null = null
let time = 0;

function init(cbSucess: (res: string) => void, cbError: (err: string) => void) {
    if (socket) return;
    socket = io("localhost:3000", { transports: ['websocket'], reconnectionDelay: 2000, });

    socket.on('connect', () => { cbSucess('socket clock connected'); });

    boucle()
}

function boucle() {
    if (!simulPause.value) {
        socket?.emit(CHANNEL_CLOCK, time);
        time += clockInterval.value;
    }
    setTimeout(boucle, clockInterval.value);
}

export default init;