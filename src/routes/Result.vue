<template>
  <div>
    <v-bar class="fullPage">
      <div v-if="sheet">
        <PageBackground
          songSrc="https://assets.rhythm-plus.com/bgm/result.mp3"
          :imageSrc="sheet.image"
          :showNav="false"
        ></PageBackground>
        <div class="blurFilter">
          <div class="center_logo darker flex_hori">
            <div class="scoreCircle" ref="resultDiv">
              <VueCircle
                :progress="result.result.percentage"
                :size="windowWidth > 1000 ? 260 : 180"
                :fill="{ gradient }"
                empty-fill="rgba(100, 100, 100, .5)"
                :thickness="10"
                :start-angle="(-1 / 2) * Math.PI"
                insert-mode="append"
                :show-percent="false"
              >
                <div class="circleBg"></div>
                <div class="score" :style="scoreShadow">{{ result.rank }}</div>
                <div style="margin-top: -20px; transform: translateZ(20px);">
                  <ICountUp
                    :endVal="result.result.percentage"
                    :options="{ decimalPlaces: 2 }"
                  />%
                </div>
              </VueCircle>
            </div>

            <div class="rightScore">
              <div>
                Score
                <div
                  class="markChip acheivementChip highScoreChip"
                  v-if="newRecord"
                >
                  New Record
                </div>
                <ICountUp
                  style="font-size: 2.7em; display: block;"
                  :endVal="result.result.score"
                  :options="{ decimalPlaces: 0 }"
                />
              </div>
              <div>
                Max Combo -
                <ICountUp
                  :endVal="result.result.maxCombo"
                  :options="{ decimalPlaces: 0 }"
                />
                <div
                  class="markChip acheivementChip comboChip"
                  v-if="result.isFullCombo"
                >
                  Full Combo
                </div>
              </div>
            </div>

            <div class="rightScore" style="text-align: left;">
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

          <!-- song section -->
          <div class="song_item_sec">
            <div class="detail">
              <div class="title">{{ sheet.song.title }}</div>
              <div>{{ sheet.song.artist }}</div>
            </div>
            <SheetDetailLine :sheet="sheet" :compact="true"></SheetDetailLine>
          </div>

          <!-- profile section -->
          <div class="user_sec">
            <UserProfileCard
              v-if="
                $store.state.currentUser &&
                result.uid === $store.state.currentUser.uid
              "
              :extend="true"
              :oldProfile="oldProfileInfo"
            />
            <UserProfileCard
              v-else-if="overrideProfile"
              :extend="true"
              :overrideProfile="overrideProfile"
            />
          </div>
        </div>
        <div class="btn_sec">
          <div class="btn-action btn-dark" @click="replay">
            <v-icon name="redo" />
            <span>Replay</span>
          </div>
          <div class="btn-action btn-dark" @click="toMenu">
            <v-icon name="arrow-right" />
            <span>Continue</span>
          </div>
        </div>
      </div>
      <Loading :show="!sheet || !result">Syncing Results...</Loading>
    </v-bar>

    <!-- level up modal -->
    <Modal
      ref="levelModal"
      :showCancel="false"
      style="text-align: center; z-index: 500;"
      @ok="$confetti.stop()"
    >
      <template v-slot:header>
        <div style="width: 100%; font-size: 23px;">Level Up!</div>
      </template>

      <template>
        <div style="opacity: 0.5;">
          Congratulations, you have now leveled up.
        </div>
        <div class="flex_hori flex_row">
          <div class="level" v-if="oldProfileInfo">
            {{ oldProfileInfo.lvd }}
          </div>
          <v-icon name="arrow-right" scale="2" />
          <div class="level">
            {{ $store.state.userProfile && $store.state.userProfile.lvd }}
          </div>
        </div>
      </template>
    </Modal>
  </div>
</template>

<script>
import PageBackground from "../components/common/PageBackground.vue";
import UserProfileCard from "../components/common/UserProfileCard.vue";
import SheetDetailLine from "../components/menus/SheetDetailLine.vue";
import Loading from "../components/ui/Loading.vue";
import Modal from "../components/ui/Modal.vue";
import {
  getGameSheet,
  getResult,
  getBestScore,
  getUserProfile,
} from "../javascript/db";
import ICountUp from "vue-countup-v2";
import VueCircle from "vue2-circle-progress/src/index.vue";
import VanillaTilt from "vanilla-tilt";

export default {
  name: "Result",
  components: {
    PageBackground,
    ICountUp,
    VueCircle,
    Loading,
    UserProfileCard,
    Modal,
    SheetDetailLine,
  },
  data() {
    return {
      showModal: false,
      result: null,
      sheet: null,
      windowWidth: window.innerWidth,
      newRecord: false,
      oldProfileInfo: null,
      overrideProfile: null,
    };
  },
  computed: {
    gradient() {
      switch (this.result.rank) {
        case "S":
          return ["#ff9c5f", "yellow"];
        case "A":
          return ["#12c2e9", "#c471ed", "#f64f59"];
        case "B":
          return ["#00b09b", "#96c93d"];
        case "C":
          return ["#8360c3", "#2ebf91"];
        case "D":
          return ["darkorange", "#ffab2d"];
        case "F":
          return ["#EB5757", "#000000"];
        default:
          return ["#00b09b", "#96c93d"];
      }
    },
    scoreShadow() {
      const g = this.gradient;
      return {
        color: "#ffffff",
        "text-shadow": `${g[0]} 0px 0px 20px, ${g[1]} 0px 0px 30px, ${
          g[2] ?? g[1]
        } 0px 0px 40px,
    ${g[0]} 0px 0px 50px, ${g[1]} 0px 0px 75px`,
      };
    },
  },
  watch: {},
  async mounted() {
    //FIXME add id and route validation
    if (this.$route.params.resultId && this.$route.params.resultId != "null") {
      try {
        this.result = await getResult(this.$route.params.resultId);
        this.sheet = await getGameSheet(this.result.sheetId);
        const bestResult = await getBestScore(this.result.sheetId);
        if (bestResult && bestResult.result.score <= this.result.result.score) {
          this.newRecord = true;
        }
      } catch (err) {
        this.showError();
      }
    } else {
      this.showError();
    }

    window.onresize = () => {
      this.windowWidth = window.innerWidth;
    };

    if (
      navigator.userAgent.indexOf("Safari") === -1 ||
      navigator.userAgent.indexOf("Chrome") !== -1
    ) {
      // add tilt effect on non-safari browsers
      this.$nextTick(() => {
        VanillaTilt.init(this.$refs.resultDiv, {
          max: 20,
          scale: 1.1,
        });
      });
    }

    if (this.result.uid !== this.$store.state.currentUser.uid) {
      this.overrideProfile = await getUserProfile(this.result.uid);
      if (this.overrideProfile.isAnonymous) this.overrideProfile = null;
    } else {
      // update local user level info
      const userProfile = this.$store.state.userProfile;
      const { lvd, exp, lv } = userProfile;
      this.oldProfileInfo = { lvd, exp, lv };

      await this.$store.dispatch("updateUserProfile");

      Logger.log(userProfile, this.oldProfileInfo);

      if (this.$store.state.userProfile.lvd > lvd) {
        Logger.warn("level up", lvd, userProfile.lvd);
        this.$refs.levelModal.show();
        this.$confetti.start();
      }
    }
  },
  beforeDestroy() {
    this.$store.state.audio.stop();
  },
  methods: {
    showError() {
      this.$store.state.gModal.show({
        bodyText: "This result is unavaliable.",
        isError: true,
        showCancel: false,
        okCallback: this.toMenu,
      });
    },
    replay() {
      this.$router.push("/game/" + this.sheet.sheetId);
    },
    toMenu() {
      this.$router.push("/menu/");
    },
  },
};
</script>

<style scoped>
.flex_hori {
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
.scoreCircle {
  transform-style: preserve-3d;
}
.score {
  font-size: 10em;
  margin-top: -20px;
  transform: translateZ(40px);
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

.acheivementChip {
  margin-top: 10px;
  width: fit-content;
}

.highScoreChip {
  box-shadow: #ffab2d 0px 0px 20px;
  background: #ff8b2d;
}

.comboChip {
  box-shadow: #68ff2d 0px 0px 20px;
  background: #00b609;
}

.song_item_sec {
  position: fixed;
  top: 10vh;
  left: 8%;
  opacity: 0.3;
}

.song_item_sec .detail {
  line-height: 1.8em;
  font-size: 1.8em;
}

.song_item_sec .title {
  font-size: 2em;
  font-weight: bold;
}

.user_sec {
  position: fixed;
  bottom: 12vh;
  left: 8%;
  opacity: 0.8;
}

.btn-dark {
  background: rgba(78, 78, 78, 0.575);
  display: inline-block;
  line-height: 30px;
  width: 150px;
  margin: 0 10px;
  font-size: 1.2em;
}

.btn-dark:hover {
  background: white;
}

.btn_sec {
  position: fixed;
  bottom: 15vh;
  right: 8%;
}

.fa-icon {
  vertical-align: middle;
  margin-right: 5px;
}

.level {
  font-size: 5em;
}

@media only screen and (max-width: 1000px) {
  /* mobile */
  .flex_hori {
    flex-direction: column;
  }

  .blurFilter {
    position: relative;
    min-height: calc(100vh + 50px);
  }
  .center_logo {
    position: relative;
    transform: none;
    height: auto;
    top: 0;
    left: 0;
    margin-top: 150px;
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

  .acheivementChip {
    display: block;
    margin: auto;
    margin-top: 10px;
  }

  .song_item_sec {
    background: rgba(0, 0, 0, 0.4);
    position: relative;
    top: auto;
    left: auto;
    text-align: center;
    font-size: 1em;
    line-height: 1.5em;
    margin: 10px auto;
    padding: 20px;
    opacity: 1;
  }
  .song_item_sec .detail {
    font-size: 1em;
    border-bottom: 1px solid rgba(121, 121, 121, 0.5);
    padding-bottom: 5px;
    margin-bottom: 8px;
  }

  .song_item_sec .title {
    font-size: 1.4em;
    font-weight: bold;
  }
  .user_sec {
    background: rgba(0, 0, 0, 0.4);
    position: relative;
    top: 0;
    left: auto;
    opacity: 1;
  }
  .user_sec .extend {
    margin: 10px auto;
    width: fit-content;
  }
  .btn_sec {
    position: fixed;
    right: auto;
    bottom: 0;
    margin: 0;
    width: 100%;
    padding: 20px;
    z-index: 9000;
    backdrop-filter: blur(40px);
    -webkit-backdrop-filter: blur(40px);
    background: rgba(0, 0, 0, 0.3);
    display: flex;
    box-sizing: border-box;
    justify-content: space-around;
  }
  .btn-dark {
    flex: 1;
  }
}

.flex_row {
  flex-direction: row;
  padding: 30px 0;
}
</style>
