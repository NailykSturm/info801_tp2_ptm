<template>
    <n-h1><n-text type="primary">INFO 801 - TP 2 - Pilotage de la température dans une Maison</n-text></n-h1>
    <n-space>
        <n-space vertical style="width: 35vw;">
            <n-h1><n-text type="primary">Paramètres</n-text></n-h1>
            <n-space>
                Plage de travail :
                <n-time-picker :default-value="tickToMs(plage.start)" @confirm="handleConfirmPlage($event, 'start')"
                    time-zone="UTC" />
                <n-time-picker :default-value="tickToMs(plage.end)" @confirm="handleConfirmPlage($event, 'end')"
                    time-zone="UTC" />
            </n-space>
            <n-divider />
            <n-space>
                Température de reférence:
                <n-input-number :min="5" :max="35" :step="1" v-model:value="tempRef" />
            </n-space>
            <n-divider />
            <n-space>
                Nombre de tick par secondes:
                <n-input-number :min="0.5" :max="10" :step="0.5" v-model:value="nbTick" />
            </n-space>
            <n-divider />
            <n-space>
                Probabilité des pannes :
                <n-space vertical>
                    <n-space vertical>
                        Erreur de démarage chaudière: 
                        <n-slider v-model:value="probaErr" :step="1"/>
                    </n-space>
                    <n-space vertical>
                        Erreur de communication:
                        <n-slider v-model:value="probaErrCom" :step="1"/>
                    </n-space>
                </n-space>
            </n-space>
        </n-space>
        
        <n-divider vertical style="height: 100%;" />

        <n-space justify="space-around">
            <n-h1><n-text type="primary">Environement</n-text></n-h1>
        </n-space>
    </n-space>
</template>

<script lang="ts">
import { defineComponent, computed, ref } from 'vue';
import { useMessage } from 'naive-ui';

import * as env from '../store/env_store';

export default defineComponent({
    setup() {
        const message = useMessage()
        
        function tickToMs(time: number) { return time * env.clockInterval.value; }
        function msToTick(time: number) { return time / env.clockInterval.value; }
        function handleConfirmPlage(value: number, type: string) {
            value = msToTick(value);
            if (type === 'start') env.plage.value.start = value;
            else env.plage.value.end = value;
        }
        return {
            plage: env.plage,
            tempRef: env.env_temp,
            nbTick: env.nbTicks,
            probaErr: env.proba_panne,
            probaErrCom: env.proba_err_comm,
            tickToMs,
            handleConfirmPlage,
        }
    }
});
</script>