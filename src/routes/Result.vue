<template>
  <div>
    <div v-if="sheet">
      <PageBackground songSrc="/songs/login.mp3" :imageSrc="sheet.image"></PageBackground>
      <div class="blurFilter"></div>
      <div class="center_logo darker flex_hori">
        <div>
          <VueCircle
            class="scoreCircle"
            :progress="result.result.percentage"
            :size="windowWidth > 1000 ? 260 : 180"
            :fill="{ gradient: ['darkorange', '#ffab2d'] }"
            empty-fill="rgba(100, 100, 100, .5)"
            :thickness="10"
            :start-angle="-1/2*Math.PI"
            insert-mode="append"
            :show-percent="false"
          >
            <div class="circleBg"></div>
            <div class="score scoreShadow">{{result.rank}}</div>
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

        <div class="rightScore" style="text-align:left">
          <div>
            <div class="markChip perfect">Perfect</div>
            <ICountUp :endVal="result.result.marks.perfect" />
          </div>
          <div>
            <div class="markChip good">Good</div>
            <ICountUp :endVal="result.result.marks.good" />
          </div>
          <div>
            <div class="markChip offbeat">Offbeat</div>
            <ICountUp :endVal="result.result.marks.offbeat" />
          </div>
          <div>
            <div class="markChip miss">Miss</div>
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
            sheet: null,
            windowWidth: window.innerWidth
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

      window.onresize = () => {
        this.windowWidth = window.innerWidth
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
  height: 20vh;
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
  margin-top: -20px;
}
.scoreShadow {
  color: #ffffff;
  text-shadow: #ffab2d 0px 0px 20px, #ffab2d 0px 0px 30px, #ffab2d 0px 0px 40px,
    #ffab2d 0px 0px 50px, #ffab2d 0px 0px 75px;
}
.rightScore {
  text-align: left;
  font-size: 1.2em;
  width: 25%;
}
.circleBg {
  position: absolute;
  top: 0;
  left: 0;
  height: 260px;
  width: 260px;
  background-color: rgb(41, 41, 41);
  border-radius: 50%;
  display: inline-block;
  z-index: -1;
}
.markChip {
  background: #ffab2d;
  display: inline-block;
  padding: 0px 10px;
  color: rgba(255, 255, 255, 0.8);
  border-radius: 50px;
  width: 70px;
  text-align: center;
  font-size: 15px;
  line-height: 20px;
  margin: 5px;
}
.perfect {
  background: rgba(0, 146, 172, 0.8);
}
.good {
  background: rgba(11, 131, 0, 0.8);
}
.offbeat {
  background: rgba(190, 92, 0, 0.8);
}
.miss {
  background: rgba(112, 0, 0, 0.8);
}

@media only screen and (max-width: 1000px) {
  /* mobile */
  .flex_hori {
    flex-direction: column;
  }

  .center_logo {
    position: relative;
    transform: none;
    height: auto;
    top: 0;
    left: 0;
    margin-top: 180px;
  }

  .rightScore {
    text-align: center;
    width: auto;
    padding: 30px;
  }
  .rightScore + .rightScore {
    padding-top: 0;
  }

  .circleBg {
    width: 180px;
    height: 180px;
  }
  .scoreCircle {
    margin-top: -90px;
  }
  .score {
    font-size: 6em;
  }
}
</style>