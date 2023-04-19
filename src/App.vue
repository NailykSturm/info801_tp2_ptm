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
    const prefersDarkMode = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    const theme = ref(prefersDarkMode ? darkTheme : lightTheme);
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
  margin-top: 60px;
}

body {
  background-color: #1c1c1c;
}
</style>
