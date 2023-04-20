import { ref, computed, Ref, ComputedRef } from "vue";

import { MODE_REGULE } from "@/controller/controller";

export const lunchReport: Ref<null|string> = ref(null);
export const simulPause: Ref<boolean> = ref(true);
export const nbTicks: Ref<number> = ref(4);
export const clockInterval: ComputedRef<number> = computed(() => { return 1000 / nbTicks.value });
export const temp_ref: Ref<number> = ref(20);
export const env_temp: Ref<number> = ref(20);
export const proba_panne: Ref<number> = ref(50);
export const proba_err_comm: Ref<number> = ref(66);
export const disjoncteur: Ref<boolean> = ref(true);
export const daytime: ComputedRef<number> = computed(() => { return clockInterval.value * 60 * 60 * 24 });
export const day: number = 1000 * 60 * 60 * 24 - 1;
export const crtl_mode: Ref<string> = ref(MODE_REGULE);
export const plage: Ref<{start: number, end: number}> = ref({ start: 0, end: day });