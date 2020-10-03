<template>
  <div>
    <div v-if="sheetInfo.length">
      <div class="text" :class="{ disabled: !vm.isSongOwner }">
        Song Visibility
        <br />
        <select v-model="songInfo.visibility">
          <option value="public">Public</option>
          <option value="unlisted">Anyone with the link</option>
          <option value="private">Private</option>
        </select>
        <br />
        <br />
      </div>

      <div class="text" :class="{ disabled: !vm.isSheetOwner }">
        Sheet Visibility
        <br />
        <select v-model="sheetInfo.visibility">
          <option value="public">Public</option>
          <option value="unlisted">Anyone with the link</option>
          <option value="private">Private</option>
        </select>
      </div>

      <div style="margin: 20px;">
        <div>Total Length - {{ sheetInfo.length.toFixed(2) }} s</div>
        <div>Note Count - {{ sheetInfo.noteCount }}</div>
        <div v-if="songPlayCount > 0">
          Song Play Count - {{ songPlayCount }}
        </div>
        <div v-if="sheetPlayCount > 0">
          Sheet Play Count - {{ sheetPlayCount }}
        </div>
      </div>

      <div class="text_button" @click="openPreview">Preview Game</div>

      <div
        class="btn-action btn-dark"
        style="display: inline-block;"
        @click="$parent.close()"
      >
        Cancel
      </div>
      <div
        class="btn-action btn-dark"
        style="display: inline-block;"
        @click="publish"
      >
        Publish
      </div>
    </div>
    <div v-else>Please save the sheet first</div>
  </div>
</template>

<script>
import { updateSong, updateSheet } from "../../javascript/db";

export default {
  name: "Publish",
  computed: {
    vm() {
      return this.$parent.$parent;
    },
    songInfo() {
      return this.vm.songInfo;
    },
    sheetInfo() {
      return this.vm.sheetInfo;
    },
  },
  data() {
    return {
      songPlayCount: 0,
      sheetPlayCount: 0,
    };
  },
  async mounted() {
    // TODO current implementation will result in too many reads
    // this.songPlayCount = await getPlayCount("songId", this.songInfo.id)
    // this.sheetPlayCount = await getPlayCount("sheetId", this.sheetInfo.id)
  },
  methods: {
    async publish() {
      if (!this.beforePublishCheck()) return;
      this.vm.loading = true;
      try {
        this.$parent.close();
        await updateSong({
          id: this.songInfo.id,
          visibility: this.songInfo.visibility,
        });
        await updateSheet({
          id: this.sheetInfo.id,
          visibility: this.sheetInfo.visibility,
        });
        this.$store.state.alert.success(
          "Publish settings changed successfully"
        );
      } catch (err) {
        this.$store.state.alert.error(
          "An error occurred, please try again",
          5000
        );
      }
      this.vm.loading = false;
    },
    beforePublishCheck() {
      if (this.sheetInfo.visibility !== "public") return true;
      if (this.vm.instance.timeArr?.length < 5) {
        this.$store.state.alert.error(
          "You have to have at least 5 notes in the sheet",
          5000
        );
        return false;
      }
      if (!this.vm.initialized) {
        this.$store.state.alert.error("The source media is broken", 5000);
        return false;
      }
      return true;
    },
    openPreview() {
      const routeData = this.$router.resolve({
        path: "/game/" + this.vm.gameSheetInfo.sheetId,
      });
      window.open(routeData.href, "_blank");
    },
  },
};
</script>

<style scoped>
.text {
  text-align: left;
  margin: auto;
  width: 240px;
}
</style>
