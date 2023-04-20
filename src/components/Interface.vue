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
                <n-text>Plage de travail :</n-text>
                <n-time-picker :default-value="tickToMs(plage.start)" @confirm="handleConfirmPlage($event, 'start')"
                    time-zone="UTC" style="width: 7vw;" />
                <n-time-picker :default-value="tickToMs(plage.end)" @confirm="handleConfirmPlage($event, 'end')"
                    time-zone="UTC" style="width: 7vw;" />
            </n-space>
            <n-divider />
            <n-space>
                <n-text>Mode du controlleur: {{ crtl_mode }}</n-text>
                <n-button v-if="crtl_mode == MODE_REGULE" @click="() => {crtl_mode = MODE_PROGRAMME}">Passer en mode programme</n-button>
                <n-button v-else @click="() => {crtl_mode = MODE_REGULE}">Passer en mode régulé</n-button>
            </n-space>
            <n-divider />
            <n-space class="center">
                <n-text>Température de reférence:</n-text>
                <n-input-number :min="5" :max="35" :step="1" v-model:value="tempRef" style="width: 7vw;" />
            </n-space>
            <n-divider />
            <n-space class="center">
                <n-text>Nombre de tick par secondes:</n-text>
                <n-input-number :min="0.5" :max="10" :step="0.5" v-model:value="nbTick" style="width: 7vw;" />
            </n-space>
            <n-divider />
            <n-space class="center">
                <n-text>Probabilité des pannes :</n-text>
                <n-space vertical class="center">
                    <n-space vertical>
                        <n-text>Erreur de démarage chaudière:</n-text>
                        <n-slider v-model:value="probaErr" :step="1" />
                    </n-space>
                    <n-space vertical>
                        <n-text>Erreur de communication:</n-text>
                        <n-slider v-model:value="probaErrCom" :step="1" />
                    </n-space>
                </n-space>
            </n-space>
        </n-space>

        <n-divider vertical style="height: 100%;" />

        <n-space justify="space-around" vertical style="overflow: hidden;">
            <n-h1><n-text type="primary">Environement</n-text></n-h1>
            <n-space vertical class="center">
                <n-space class="center">
                    <n-text
                        :type="chaudiere_state == chaud_states.STATE_ACTIVE ? 'info' : chaudiere_state == chaud_states.STATE_DESACTIVE ? 'warning' : 'error'">
                        Etat de la chaudière: {{ chaudiere_state }}
                    </n-text>
                    <n-divider vertical />
                    <n-space>
                        <n-text>Etat du disjoncteur: </n-text>
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
                    <n-text>Température de l'environnement: {{ tempRef }}°C</n-text>
                    <n-space >
                        <n-timeline horizontal style="overflow-x: hidden;">
                            <n-timeline-item v-for="step in last_temps" :type="tempLessThanPrevious(step) ? 'warning' : 'info'"
                                :title="`${formatTime(step.time%day)}`" :content="`${step.temp}°C`" />
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
import * as chans from '../socket_channel';
import * as env from '../store/env_store';
import { MODE_REGULE, MODE_PROGRAMME } from '../controller/controller';

export default defineComponent({
    setup() {
        const msg = useMessage()

        const chaudiere_state = ref(chaud_states.STATE_UNKNOWN);
        const last_temps = ref([{ "temp": env.env_temp.value, "time": 0, "id": 0 }]);
        const daytime =  computed(() => { return tickToMs(last_temps.value[last_temps.value.length - 1].time) });

        const socket = io(process.env.VUE_APP_SOCKET_URI || "localhost:3000", { transports: ['websocket'] });
        socket.on('connect', () => { msg.success('Socket UI connected'); });
        socket.on(chans.CHANNEL_CLOCK, (time) => {
            last_temps.value.push({ 'time': time, 'temp': env.env_temp.value, "id": last_temps.value.length });
            if (last_temps.value.length > 10) last_temps.value.shift();
        });
        socket.on(chans.CHANNEL_STATE_CHAUD, (state: string) => { chaudiere_state.value = state; });

        /**
         * Function that format the simulation time
         * @param time time in ms
         * @returns time in hr:min:sec
         */
        function formatTime(time: number) { 
            const hr = Math.floor(time / 3600000);
            const mn = Math.floor((time % 3600000) / 60000);
            const sec = (((time % 3600000) % 60000) / 1000).toFixed(2);
            return `${hr < 10 ? '0'+hr : hr}h${mn < 10 ? '0'+mn : mn}:${parseInt(sec) < 10 ? '0'+sec : sec}`;    
        }
        function tickToMs(time: number) { return time * env.clockInterval.value; }
        function msToTick(time: number) { return time / env.clockInterval.value; }
        function handleConfirmPlage(value: number, type: string) {
            value = msToTick(value);
            if (type === 'start') env.plage.value.start = value;
            else env.plage.value.end = value;
        }
        function tempLessThanPrevious(step: {temp: number, time: number, id: number}): boolean {
            const elIdx = last_temps.value.findIndex((el) => el.id === step.id);
            if (elIdx == 0) return false;
            return step.temp < last_temps.value[elIdx - 1].temp;
        }
        return {
            MODE_REGULE,
            MODE_PROGRAMME,
            chaud_states,
            pause: env.simulPause,
            plage: env.plage,
            tempRef: env.temp_ref,
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
            tempLessThanPrevious,
        }
    }
});
</script>

<style>
.center {
    align-items: center;
}
</style>