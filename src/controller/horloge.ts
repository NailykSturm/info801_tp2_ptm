import { io } from "socket.io-client";

import { clockInterval, simulPause } from "../store/env_store";
import { CHANNEL_CLOCK } from "../socket_channel";

let socket: any | null = null
let time = 0;

function init(cbSucess: any, cbError: any) {
    if (socket) return;
    socket = io("localhost:3000", { transports: ['websocket'], reconnectionDelay: 2000, });

    socket.on('connect', () => { cbSucess('socket clock connected'); });

    setInterval(() => {
        if (simulPause.value) return;
        console.log(time);
        socket.emit(CHANNEL_CLOCK, time);
        time += clockInterval.value;
    }, clockInterval.value);
}

export default init;