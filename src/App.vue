<template>
   <div id="app" class="unselectable">
      <PlayControl ref="control"></PlayControl>

      <div class="center" ref="hitIndicator">
        {{lastMark}} {{combo>=5?combo:''}}
      </div>

      <canvas ref="mainCanvas"></canvas>

      <!-- visualizer space -->
      <div class="visualizer">
        <div class="blurFilter" v-if="visualizer==4"></div>
        <div ref="visualizerSpace" id="visualizer"></div>
      </div>

      <div id="ytPlayer" v-show="srcMode=='youtube'"></div>
    </div>
</template>

<script>
import PlayControl from './components/PlayControl.vue';

export default {
  name: 'App',
  components: {
    PlayControl,
  },
};
</script>

<style>
</style>
