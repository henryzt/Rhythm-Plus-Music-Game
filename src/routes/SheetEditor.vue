<template>
  <div>
    <PageBackground songSrc="/songs/select.mp3"></PageBackground>

    <div class="center_logo">
      <info-editor></info-editor>
    </div>
  </div>
</template>


<script>
import PageBackground from '../components/PageBackground.vue';
import InfoEditor from '../components/InfoEditor.vue';


export default {
  name: 'SheetEditor',
  components:{
      PageBackground,
      InfoEditor
  },
  data(){
        return {
            
        }
    },
    computed: {

    },
    watch: {

    },
    mounted() {

    },
    methods: {

    }
};
</script>

<style scoped>
</style>