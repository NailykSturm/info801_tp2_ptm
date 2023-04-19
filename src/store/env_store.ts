// import { MODE_REGULE } from "../controller/controller";
import { ref, computed, Ref } from "vue";

import { MODE_REGULE } from "../controller/controller";

export const lunchReport: Ref<null|string> = ref(null);
export const simulPause = ref(true);
export const nbTicks = ref(4);
export const clockInterval = computed(() => { return 1000 / nbTicks.value });
export const temp_ref = ref(20);
export const env_temp = ref(20);
export const proba_panne = ref(50);
export const proba_err_comm = ref(66);
export const disjoncteur = ref(true);
export const daytime = computed(() => { return clockInterval.value * 60 * 60 * 24 });
export const day = 1000 * 60 * 60 * 24 - 1;
export const crtl_mode = ref(MODE_REGULE);
export const plage = ref({ start: 0, end: day });