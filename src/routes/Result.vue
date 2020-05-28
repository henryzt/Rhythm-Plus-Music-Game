<template>
  <div>
    <PageBackground v-if="sheet" songSrc="/songs/login.mp3" :imageSrc="sheet.image"></PageBackground>
    <div class="blurFilter"></div>
    <div class="center_logo darker flex_hori">
      <div>
        <div>{{result.rank}}</div>
        <div>{{result.result.percentage}}</div>
      </div>
      <div>
        <div>{{result.result.score}}</div>
        <div>{{result.result.maxCombo}}</div>
        <div>
          <div>{{result.result.marks.perfect}}</div>
          <div>{{result.result.marks.good}}</div>
          <div>{{result.result.marks.offbeat}}</div>
          <div>{{result.result.marks.miss}}</div>
        </div>
      </div>
    </div>
  </div>
</template>


<script>
import PageBackground from '../components/PageBackground.vue';
import Modal from '../components/Modal.vue';
import { getSheet, getResult } from "../javascript/db"

export default {
  name: 'Result',
  components:{
      PageBackground,
      Modal
  },
  data(){
        return {
            showModal: false,
            result: null,
            sheet: null
        }
    },
    computed: {

    },
    watch: {

    },
    async mounted() {
      //FIXME add id and route validation
      if(this.$route.params.resultId && this.$route.params.resultId!="null"){
        this.result = await getResult(this.$route.params.resultId)
        this.sheet = await getSheet(this.result.sheetId)
      }
    },
    methods: {

    }
};
</script>

<style scoped>
.flex_hori {
  display: flex;
  align-items: center;
  flex-direction: row;
  justify-content: space-evenly;
}
.center_logo {
  background: rgba(0, 0, 0, 0.4);
  height: 30vh;
  width: 100vw;
  animation: none;
}
.blurFilter {
  z-index: 0;
}
.darker {
  backdrop-filter: blur(50px);
  -webkit-backdrop-filter: blur(50px);
}
</style>