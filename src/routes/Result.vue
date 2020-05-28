<template>
  <div>
    <div v-if="sheet">
      <PageBackground songSrc="/songs/login.mp3" :imageSrc="sheet.image"></PageBackground>
      <div class="blurFilter"></div>
      <div class="center_logo darker flex_hori">
        <div>
          <VueCircle
            :progress="result.result.percentage"
            :size="260"
            :fill="{ gradient: ['darkorange', '#ffab2d'] }"
            empty-fill="rgba(100, 100, 100, .5)"
            :thickness="10"
            :start-angle="-1/2*Math.PI"
            insert-mode="append"
            :show-percent="false"
          >
            <div class="score scoreShadow" style="margin-top:-20px">{{result.rank}}</div>
            <div style="margin-top:-20px">
              <ICountUp :endVal="result.result.percentage" :options="{decimalPlaces:2}" />%
            </div>
          </VueCircle>
        </div>

        <div class="rightScore">
          <div>
            Score
            <br />
            <ICountUp
              style="font-size:2.7em"
              :endVal="result.result.score"
              :options="{decimalPlaces:0}"
            />
          </div>
          <div>
            Max Combo -
            <ICountUp :endVal="result.result.maxCombo" :options="{decimalPlaces:0}" />
          </div>
        </div>

        <div class="rightScore">
          <div>
            Perfect -
            <ICountUp :endVal="result.result.marks.perfect" />
          </div>
          <div>
            Good -
            <ICountUp :endVal="result.result.marks.good" />
          </div>
          <div>
            Offbeat -
            <ICountUp :endVal="result.result.marks.offbeat" />
          </div>
          <div>
            Miss -
            <ICountUp :endVal="result.result.marks.miss" />
          </div>
        </div>
      </div>
    </div>
    <Loading :show="!sheet || !result">Syncing Results...</Loading>
  </div>
</template>


<script>
import PageBackground from '../components/PageBackground.vue';
import Modal from '../components/Modal.vue';
import { getSheet, getResult } from "../javascript/db"
import ICountUp from 'vue-countup-v2';
import VueCircle from 'vue2-circle-progress/src/index.vue'
import Loading from '../components/Loading.vue';

export default {
  name: 'Result',
  components:{
      PageBackground,
      Modal,
      ICountUp,
      VueCircle,
      Loading
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
.score {
  font-size: 10em;
}
.scoreShadow {
  color: #ffffff;
  text-shadow: #ffab2d 0px 0px 20px, #ffab2d 0px 0px 30px, #ffab2d 0px 0px 40px,
    #ffab2d 0px 0px 50px, #ffab2d 0px 0px 75px;
}
.rightScore {
  text-align: left;
  font-size: 1.2em;
}
@media only screen and (max-width: 1000px) {
  /* mobile */
  .flex_hori {
    flex-direction: column;
  }

  .center_logo {
    height: auto;
  }
}
</style>