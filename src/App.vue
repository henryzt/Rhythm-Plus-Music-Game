<template>
   <div id="app" class="unselectable">
        <Game></Game>
   </div>

</template>

<script>
import Game from './routes/Game.vue';

export default {
  name: 'App',
  components: {
    Game,
  },
};
</script>

<style>
</style>
