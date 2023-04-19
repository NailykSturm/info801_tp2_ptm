<template>
    <n-h1><n-text type="primary">INFO 801 - TP 2 - Pilotage de la température dans une Maison</n-text></n-h1>
    <n-space>
        <n-space vertical>
            <n-h1><n-text type="primary">Paramètres</n-text></n-h1>
            <n-space>
                Plage de travail : 
                <n-time-picker :default-value="tickToMs(plage.start)" @confirm="handleConfirm($event, 'start')" time-zone="UTC" />
                <n-time-picker :default-value="tickToMs(plage.end)" @confirm="handleConfirm($event, 'end')" time-zone="UTC" />
            </n-space>
        </n-space>
        <n-divider vertical />
        <n-space justify="space-around">
            <n-h1><n-text type="primary">Environement</n-text></n-h1>
        </n-space>
    </n-space>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { useMessage } from 'naive-ui';

import { plage, clockInterval } from '../store/env_store';

export default defineComponent({
    setup(){
        const message = useMessage()
        function tickToMs(time: number){ return time * clockInterval.value; };
        function msToTick(time: number){ return time / clockInterval.value; };
        return {
            handleConfirm (value: number, type: string) {
                value = msToTick(value);
                message.info(`Plage ${type} set to ${value} ticks`)
                if (type === 'start') {
                    plage.value.start = value;
                } else {
                    plage.value.end = value;
                }
            },
            plage,
            tickToMs,
        }
    }
});
</script>