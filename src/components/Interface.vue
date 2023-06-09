<template>
    <n-h1><n-text type="primary">INFO 801 - TP 2 - Pilotage de la température dans une Maison</n-text></n-h1>
    <n-space>
        <n-space vertical>
            <n-h1><n-text type="primary">Paramètres</n-text></n-h1>
            <n-space class="center">
                <n-text>Simulation en {{ pause ? 'pause' : 'cours' }}</n-text>
                <n-button secondary @click="() => { pause = !pause }">{{ pause ? 'reprendre' : 'arrêter' }}</n-button>
            </n-space>
            <n-divider />
            <n-space class="center">
                <n-text>Aller à l'heure spécifiée :</n-text>
                <n-time-picker :default-value="0" @change="handleJumpTo" time-zone="UTC" style="width: 7vw;" />
            </n-space>
            <n-divider />
            <n-space class="center">
                <n-text>Plage de travail :</n-text>
                <n-time-picker :default-value="0" @change="handleConfirmPlage($event, 'start')" time-zone="UTC"
                    style="width: 7vw;" />
                <n-time-picker :default-value="0" @change="handleConfirmPlage($event, 'end')" time-zone="UTC"
                    style="width: 7vw;" />
            </n-space>
            <n-divider />
            <n-space>
                <n-text>Mode du controlleur: {{ crtl_mode }}</n-text>
                <n-button v-if="crtl_mode === MODE_REGULE" @click="() => { crtl_mode = MODE_PROGRAMME }">Passer en mode
                    programmé</n-button>
                <n-button v-else @click="() => { crtl_mode = MODE_REGULE }">Passer en mode régulé</n-button>
            </n-space>
            <n-divider />
            <n-space class="center">
                <n-text>Température de référence :</n-text>
                <n-input-number :min="5" :max="35" :step="1" v-model:value="tempRef" style="width: 7vw;" />
            </n-space>
            <n-divider />
            <n-space class="center">
                <n-text>Nombre de ticks par secondes :</n-text>
                <n-input-number :min="0.5" :max="10" :step="0.5" v-model:value="nbTick" style="width: 7vw;" />
            </n-space>
            <n-divider />
            <n-space class="center">
                <n-text>Probabilité des pannes :</n-text>
                <n-space vertical class="center">
                    <n-space vertical>
                        <n-text>Erreur de démarage chaudière :</n-text>
                        <n-slider v-model:value="probaErr" :step="1" />
                    </n-space>
                    <n-space vertical>
                        <n-text>Erreur de communication :</n-text>
                        <n-slider v-model:value="probaErrCom" :step="1" />
                    </n-space>
                </n-space>
            </n-space>
        </n-space>

        <n-divider vertical style="height: 100%;" />

        <n-space justify="space-around" vertical>
            <n-h1><n-text type="primary">Environement</n-text></n-h1>
            <n-space vertical class="center">
                <n-space class="center">
                    <n-text
                        :type="chaudiere_state === chaud_states.STATE_ACTIVE ? 'info' : chaudiere_state === chaud_states.STATE_DESACTIVE ? 'warning' : 'error'">
                        Etat de la chaudière : {{ chaudiere_state }}
                    </n-text>
                    <n-divider vertical />
                    <n-space>
                        <n-text>Etat du disjoncteur : </n-text>
                        <n-switch v-model:value="disjo" />
                    </n-space>
                    <n-divider vertical />
                    <n-space class="center">
                        <n-text>Heure dans la simulation :</n-text>
                        <n-time-picker disabled v-model:value="daytime" time-zone="UTC" style="width: 7vw;" />
                    </n-space>
                </n-space>
                <n-divider />
                <n-space vertical class="center">
                    <n-text>Température actuelle : {{ temps_env }}°C</n-text>
                    <n-space>
                        <n-timeline>
                            <n-timeline-item v-for="step in [...last_temps].reverse()" :key="step.parsed" type="info"
                                :title="`${step.parsed}`" :content="`${step.temp}°C`" />
                        </n-timeline>
                    </n-space>
                </n-space>

                <n-divider v-if="rapport" />
                <n-space v-if="rapport">
                    <n-h6><n-text>Erreur lors du lancement : {{ rapport }}</n-text></n-h6>
                </n-space>
            </n-space>
        </n-space>
    </n-space>
</template>

<script lang="ts">
import { defineComponent, ref, computed } from 'vue';
import { useMessage } from 'naive-ui';
import { io } from 'socket.io-client';

import * as chaud_states from '../controller/chaudiere';
import { setTime } from '../controller/horloge';
import * as chans from '../socket_channel';
import * as env from '../store/env_store';
import { MODE_REGULE, MODE_PROGRAMME } from '../controller/controller';

export default defineComponent({
    setup: function () {
        const msg = useMessage();

        const chaudiere_state = ref(chaud_states.STATE_UNKNOWN);
        const last_temps = ref([{ "temp": env.env_temp.value, "time": 0, "id": 0, "parsed": formatTime(0) }]);
        const daytime = computed(() => {
            return tickToMs(last_temps.value[last_temps.value.length - 1].time)
        });

        const socket = io(process.env.VUE_APP_SOCKET_URI || "localhost:3000", { transports: ['websocket'] });
        socket.on('connect', () => {
            msg.success('Socket UI connected');
        });
        socket.on(chans.CHANNEL_CLOCK, (time) => {
            last_temps.value.push({ 'time': time, 'temp': env.env_temp.value, "id": last_temps.value.length, "parsed": formatTime(time) });
            if (last_temps.value.length > 10) last_temps.value.shift();
        });
        socket.on(chans.CHANNEL_STATE_CHAUD, (state: string) => {
            chaudiere_state.value = state;
        });

        /**
         * Function that format the simulation time
         * @param time time in ms
         * @returns time in hr:min:sec
         */
        function formatTime(time: number) {
            time = time % (24 * 3600000);
            const hr = Math.floor(time / 3600000);
            const mn = Math.floor((time % 3600000) / 60000);
            const sec = (((time % 3600000) % 60000) / 1000).toFixed(2);
            return `${hr < 10 ? '0' + hr : hr}h${mn < 10 ? '0' + mn : mn}:${parseInt(sec) < 10 ? '0' + sec : sec}`;
        }

        function tickToMs(time: number) {
            return time * env.clockInterval.value;
        }

        function msToTick(time: number) {
            return time / env.clockInterval.value;
        }

        function fixValueDatePicker(value: number) {
            return (parseInt((value / 1000).toString()) * 1000 + env.day + 1) % (env.day + 1);
        }

        function handleConfirmPlage(value: number, type: string) {
            value = msToTick(fixValueDatePicker(value));
            if (type === 'start') env.plage.value.start = value;
            else env.plage.value.end = value;
        }

        function handleJumpTo(value: number) {
            const new_time = fixValueDatePicker(value);
            console.log(msToTick(new_time));
            setTime(msToTick(new_time));
        }

        return {
            MODE_REGULE,
            MODE_PROGRAMME,
            chaud_states,
            pause: env.simulPause,
            plage: env.plage,
            tempRef: env.temp_ref,
            temps_env: env.env_temp,
            nbTick: env.nbTicks,
            probaErr: env.proba_panne,
            probaErrCom: env.proba_err_comm,
            disjo: env.disjoncteur,
            rapport: env.lunchReport,
            crtl_mode: env.crtl_mode,
            day: env.daytime,
            daytime,
            chaudiere_state,
            last_temps,
            tickToMs,
            formatTime,
            handleConfirmPlage,
            handleJumpTo,
        }
    }
});
</script>

<style>
.center {
    align-items: center;
}
</style>