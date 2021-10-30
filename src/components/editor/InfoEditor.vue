<template>
  <div class="padding" style="height: 100%; overflow: scroll;">
    <div v-if="!$parent.songInfo.id && welcomeScreen">
      <h2>Welcome to R+ Sheet Editor</h2>
      <p>
        It is very easy to create a beatmap in Rhythm+, just create as you are
        playing one!
      </p>
      <p>What would you like to create today?</p>
      <input
        type="submit"
        value="Create a new sheet"
        @click="welcomeScreen = false"
      />
      <input
        type="submit"
        value="Choose existing or Continue your work"
        @click="continueExisting"
      />
    </div>

    <div v-else>
      <!-- song create update form -->
      <div v-if="!$parent.songInfo.id || songFormOptions.isUpdate">
        <h2 v-if="songFormOptions.isUpdate">Update Song Detail</h2>
        <h2 v-else>Create or Select Song</h2>
        <InfoForm
          :formData="songFormData"
          :formOption="songFormOptions"
          item-type="Song"
          @submitForm="submitSongForm"
          @submitExisting="submitExistingSong"
          :class="{ disabled: !$parent.isSongOwner }"
          :tags="tags"
        ></InfoForm>
        <div v-if="!$parent.isSongOwner">
          You have no edit access to this song.
        </div>
        <div
          v-if="songFormOptions.isUpdate"
          class="switch_tab"
          @click="songFormOptions.isUpdate = false"
        >
          Cancel
        </div>
      </div>

      <div v-if="$parent.songInfo.id">
        <div>
          <div
            v-if="!sheetFormOptions.isUpdate"
            @click="change(false)"
            class="changeBtn"
          >
            Change Song
          </div>
          <div v-else @click="change(true)" class="changeBtn">
            Change Sheet
          </div>
          <h2>Sheet Detail</h2>
          <InfoForm
            :formData="sheetFormData"
            :formOption="sheetFormOptions"
            item-type="Sheet"
            @submitForm="submitSheetForm"
            @submitExisting="submitExistingSheet"
            :tags="tags"
            :class="{ disabled: !$parent.isSheetOwner }"
          >
            <input
              v-model="sheetFormData.title"
              name="sheetTitle"
              placeholder="Sheet title (Optional)"
              type="text"
            />
            <select v-model="sheetFormData.difficulty">
              <option :value="null" disabled>Select difficulty...</option>
              <option v-for="diff in 10" :value="diff" :key="diff">{{
                diff +
                " - " +
                (diff > 9
                  ? "Expert"
                  : diff > 6
                  ? "Hard"
                  : diff > 3
                  ? "Normal"
                  : "Easy")
              }}</option>
            </select>
            <select
              v-model="sheetFormData.visualizerName"
              v-if="
                $parent.songInfo.srcMode == 'url' && $parent.visualizerInstance
              "
            >
              <option :value="null" disabled
                >Select Default Visualizer...</option
              >
              <option
                v-for="(idx, visualizer) in $parent.visualizerInstance
                  .visualizerArr"
                :value="idx"
                :key="idx"
                >{{ visualizer }}</option
              >
            </select>
            <select v-model="sheetFormData.keys">
              <option :value="null" disabled>Select Key Number...</option>
              <option
                v-for="keys in [4, 5, 6, 7, 8]"
                :value="keys"
                :key="keys"
                >{{ keys + " Key" }}</option
              >
            </select>
            <input
              v-if="sheetFormOptions.isUpdate"
              v-model="sheetFormData.startAt"
              step="0.1"
              placeholder="Start time (In seconds, Optional)"
              type="number"
            />
            <input
              v-if="sheetFormOptions.isUpdate"
              v-model="sheetFormData.endAt"
              step="0.1"
              placeholder="End time (In seconds, Optional)"
              type="number"
            />
          </InfoForm>
          <div v-if="!$parent.isSheetOwner">
            You have no edit access to this sheet.
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import {
  createSong,
  createSheet,
  getSongList,
  getSong,
  getSheetList,
  updateSong,
  updateSheet,
  getTags,
} from "../../javascript/db";
import InfoForm from "./InfoForm.vue";

export default {
  name: "InfoEditor",
  components: {
    InfoForm,
  },
  data() {
    return {
      songFormData: {
        title: null,
        artist: null,
        image: null,
        srcMode: "youtube",
        tags: [],
      },
      songFormOptions: {
        isYoutubeMode: true,
        tab: "form",
        publicList: null,
        privateList: null,
        selected: null,
        isUpdate: false,
      },
      sheetFormData: {
        title: null,
        difficulty: null,
        visualizerName: null,
        keys: null,
      },
      sheetFormOptions: {
        isYoutubeMode: true,
        tab: "form",
        publicList: null,
        privateList: null,
        selected: null,
        isUpdate: false,
      },
      welcomeScreen: true,
      tags: [],
    };
  },
  computed: {},
  watch: {
    "$parent.sheetInfo"() {
      let sheetInfo = this.$parent.sheetInfo;
      if (sheetInfo.id != null) {
        this.sheetFormData = this.$parent.sheetInfo;
        this.sheetFormOptions.isUpdate = true;
        this.sheetFormOptions.tab = "form";
      }
    },
  },
  async mounted() {
    this.songFormOptions.publicList = await getSongList();
    this.songFormOptions.privateList = await getSongList(true);
    this.tags = await getTags();
    if (this.$route.query.song) {
      this.sheetFormOptions.tab = "choose";
    }
  },
  methods: {
    continueExisting() {
      this.welcomeScreen = false;
      this.songFormOptions.tab = "choose";
      this.sheetFormOptions.tab = "choose";
    },
    async submitSongForm() {
      try {
        if (this.songFormOptions.isUpdate) {
          if (!(await this.$parent.saveWarning())) return;
          this.$parent.loading = true;
          await updateSong(this.songFormData);
          if (!this.$route.query.song) {
            this.$router.push({ query: { update: true } });
          }
          this.$parent.reloadEditor();
        } else {
          this.$parent.loading = true;
          let songId = await createSong(this.songFormData);
          this.$parent.songInfo = await getSong(songId);
          this.getSheets(true);
          this.$store.state.alert.success("Song created");
        }
      } catch (err) {
        this.handleFormError(err);
      }
    },
    submitExistingSong() {
      let selectedSong = this.songFormOptions.selected;
      if (selectedSong) {
        this.$parent.songInfo = selectedSong;
        this.getSheets(true);
      }
    },
    async getSheets(addQuery) {
      const songId = this.$parent.songInfo.id;
      if (addQuery) {
        this.$router.replace({ path: "/editor", query: { song: songId } });
      }
      this.sheetFormOptions.publicList = await getSheetList(songId);
      this.sheetFormOptions.privateList = await getSheetList(
        songId,
        true,
        true
      );
    },
    async submitSheetForm() {
      try {
        if (this.sheetFormOptions.isUpdate) {
          if (!(await this.$parent.saveWarning())) return;
          this.$parent.loading = true;
          this.sheetFormData.startAt = this.sheetFormData.startAt
            ? Number(this.sheetFormData.startAt)
            : null;
          this.sheetFormData.endAt = this.sheetFormData.endAt
            ? Number(this.sheetFormData.endAt)
            : null;
          delete this.sheetFormData.sheet;
          await updateSheet(this.sheetFormData);
          this.$router.push({ query: { save: true } });
        } else {
          this.$parent.loading = true;
          const songId = this.$parent.songInfo.id;
          this.sheetFormData.songId = songId;
          let sheetId = await createSheet(this.sheetFormData);
          this.$router.push("/editor/" + sheetId);
        }
        this.$parent.reloadEditor();
      } catch (err) {
        this.handleFormError(err);
      }
    },
    submitExistingSheet() {
      let selectedSheet = this.sheetFormOptions.selected;
      if (selectedSheet) {
        this.$parent.loading = true;
        this.$router.push("/editor/" + selectedSheet.id + "/");
        this.$parent.reloadEditor();
      }
    },
    handleFormError(err) {
      this.$parent.loading = false;
      this.$store.state.alert.error("Please fill in required fields", 5000);
      Logger.error(err);
    },
    async openSongUpdate() {
      this.songFormOptions.tab = "form";
      this.songFormOptions.isUpdate = true;
      this.songFormData = await getSong(this.$parent.songInfo.id);
      if (
        this.songFormData.image &&
        this.songFormData.image.includes("img.youtube.com")
      ) {
        this.songFormData.image = null;
      }
    },
    async change(isChangeSheet) {
      if (await this.$parent.saveWarning()) {
        const songId = isChangeSheet ? "?song=" + this.$parent.songInfo.id : "";
        this.$router.push("/editor/" + songId);
        this.$parent.reloadEditor();
      }
    },
  },
};
</script>

<style>
.padding {
  padding: 30px;
}
.switch_tab {
  text-align: center;
  opacity: 0.5;
  font-size: 14px;
  margin: 10px;
  cursor: pointer;
}
.changeBtn {
  float: right;
  line-height: 30px;
  opacity: 0.5;
  cursor: pointer;
}
</style>
