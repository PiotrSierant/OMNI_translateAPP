<template>
  <div id="app">
    <ComponentAddNewLanguages />
  </div>
</template>

<script>
import ComponentAddNewLanguages from '@/components/Main/ComponentAddNewLanguages.vue';
export default {
  name: 'App',
  components: {
    ComponentAddNewLanguages,
  },
}
</script>

<style lang="scss">
*,
*::after,
*::before {
  padding: 0;
  margin: 0;
  box-sizing: border-box;
}
#app {
  margin: 0 auto;
  max-width: 1000px;
}
</style>