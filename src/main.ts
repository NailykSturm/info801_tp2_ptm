import { createApp } from 'vue';
import naive from 'naive-ui';
import { io } from 'socket.io-client';

import App from './App.vue';

const socketTest = io(process.env.VUE_APP_SOCKET_URI || "localhost:3000", {transports: ['websocket'],});
socketTest.on('connect', () => { console.log('socket test connected'); });


const app = createApp(App);
app.use(naive);
app.mount('#app');
