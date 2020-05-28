<template>
  <div v-if="sheet">
    <PageBackground songSrc="/songs/login.mp3" :imageSrc="sheet.image"></PageBackground>
    <div class="blurFilter"></div>
    <div class="center_logo darker flex_hori">
      <div>
        <VueCircle
          :progress="result.result.percentage"
          :size="270"
          line-cap="round"
          :fill="{ gradient: ['orange', 'yellow'] }"
          empty-fill="rgba(100, 100, 100, .5)"
          :thickness="10"
          insert-mode="append"
          :show-percent="false"
        >
          <div class="score scoreShadow">{{result.rank}}</div>
          <div>
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
</template>


<script>
import PageBackground from '../components/PageBackground.vue';
import Modal from '../components/Modal.vue';
import { getSheet, getResult } from "../javascript/db"
import ICountUp from 'vue-countup-v2';
import VueCircle from 'vue2-circle-progress/src/index.vue'

export default {
  name: 'Result',
  components:{
      PageBackground,
      Modal,
      ICountUp,
      VueCircle
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
</style>