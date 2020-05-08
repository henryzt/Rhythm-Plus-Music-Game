<template>
  <div id="app" class="unselectable">
    <transition name="fade">
      <router-view />
    </transition>
  </div>
</template>

<script>

export default {
  name: 'App',
  components: {
  },
};
</script>

<style>
.fade-enter-active,
.fade-leave-active {
  transition: 1s;
}
.fade-enter, .fade-leave-to /* .fade-leave-active below version 2.1.8 */ {
  opacity: 0;
}
</style>
