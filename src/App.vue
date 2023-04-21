<template>
  <n-config-provider :theme="theme">
    <n-loading-bar-provider>
      <n-message-provider>
        <n-notification-provider>
          <n-dialog-provider>
            <socket />
            <interface />
          </n-dialog-provider>
        </n-notification-provider>
      </n-message-provider>
    </n-loading-bar-provider>
  </n-config-provider>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue';
import { lightTheme, darkTheme } from 'naive-ui';

import Interface from './components/Interface.vue';
import Socket from './components/Socket.vue';

export default defineComponent({
  name: 'App',
  setup() {
    const theme = ref(darkTheme);
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
      if(e.matches) theme.value = darkTheme; 
      else theme.value = lightTheme;
    })

    return {
      theme,
    }
  },
  components: {
    interface: Interface,
    socket: Socket,
  }
});
</script>

<style>
#app {
  /* font-family: Avenir, Helvetica, Arial, sans-serif; */
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  margin-top: 10px;
  margin-left: 15px;
  margin-right: 15px;
}

body {
  background-color: #DFDFDF;
}

@media (prefers-color-scheme: dark) {
  body {
    background-color: #1c1c1c;
  }
}
</style>
