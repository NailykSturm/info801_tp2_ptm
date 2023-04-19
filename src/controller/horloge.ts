import { io } from "socket.io-client";

import { clockInterval } from "../store/env_store";
import { CHANNEL_CLOCK } from "../socket_channel";

let socket: any | null = null
let time = 0;

function init(cbSucess: any, cbError: any) {
    if (socket) return;
    socket = io("localhost:3000", {
        transports: ['websocket'],
    });

    socket.on('connect', () => { cbSucess('socket clock connected'); });

    setInterval(() => {
        socket.emit(CHANNEL_CLOCK, time);
        time += clockInterval.value;
    }, clockInterval.value);
}

export default init;