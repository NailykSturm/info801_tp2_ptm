// import { MODE_REGULE } from "../controller/controller";
import { ref, computed } from "vue";

export const clockInterval = ref(250);
export const temp_ref = ref(20);
export const env_temp = ref(20);
export const proba_panne = ref(0.5);
export const disjoncteur = ref(true);
export const daytime = computed(() => { return clockInterval.value * 60 * 60 * 24 });
export const day = 1000 * 60 * 60 * 24 - 1;
export const crtl_mode = ref(null);
export const plage = ref({ start: 0, end: day });