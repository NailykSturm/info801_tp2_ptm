<script lang="ts">
import { defineComponent } from 'vue';
import { useMessage } from 'naive-ui';

import capteur from '../controller/capteur';
import chaud from '../controller/chaudiere';
import control from '../controller/controller';
import clock from '../controller/horloge';

export default defineComponent({
    setup() {
        const msg = useMessage();
        function cbRes(res: any) { msg.success(res); }
        function cbErr(res: any) { msg.error(res); }

        capteur(cbRes, cbErr);
        chaud(cbRes, cbErr);
        control(cbRes, cbErr);
        clock(cbRes, cbErr);
    }
})
</script>
<template></template>