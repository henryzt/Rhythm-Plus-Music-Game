<template>
  <div>
    <div class="flex_hori">
      <div style="flex-grow: 1;"></div>
      <div class="clip"><v-icon name="search" />Search</div>
      <div class="mSection flex_hori">
        <div class="clip" @click="showSort = !showSort">
          <v-icon :name="!showSort ? 'sort-amount-down' : 'times'" />Sort
        </div>
        <div class="flex_hori" v-if="showSort">
          <div style="flex-grow: 1;"></div>
          <div class="clip clip_outlined" @click="sortByTitle">Title</div>
          <div class="clip clip_outlined" @click="sortByDate">Date</div>
          <div class="clip clip_outlined" @click="sortByArtist">Artist</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import "vue-awesome/icons/search";
import "vue-awesome/icons/sort-amount-down";
import "vue-awesome/icons/times";

export default {
  name: "SheetFilter",
  props: ["songs", "tags"],
  data: function () {
    return {
      showSort: false,
      currentSort: null,
      reverseSort: false,
    };
  },
  mounted() {
    this.sortByTitle();
  },
  methods: {
    finishSort(sortName) {
      if (this.currentSort === sortName) {
        this.reverseSort = !this.reverseSort;
      } else {
        this.reverseSort = false;
      }
      if (this.reverseSort) this.songs.reverse();
      this.currentSort = sortName;
      this.$emit("sorted", this.songs);
    },
    sortByTitle() {
      this.songs.sort((a, b) => a.title.localeCompare(b.title));
      this.finishSort("title");
    },
    sortByArtist() {
      this.songs.sort((a, b) => a.artist.localeCompare(b.artist));
      this.finishSort("artist");
    },
    sortByDate() {
      this.songs.sort((a, b) => b.dateCreated.seconds - a.dateCreated.seconds);
      this.finishSort("date");
    },
  },
};
</script>

<style scoped>
.clip {
  background: rgba(184, 184, 184, 0.5);
  padding: 6px 15px;
  border-radius: 20px;
  font-size: 16px;
  margin: 0 5px;
  cursor: pointer;
  transition: 0.5s;
}

.clip:hover {
  background: rgba(184, 184, 184, 0.8);
}

.clip_outlined {
  background: transparent;
  padding: 5px 15px;
  border: 1px solid #b8b8b8;
}

.fa-icon {
  vertical-align: middle;
  margin-right: 5px;
  margin-bottom: 1px;
}

.sBlock {
  display: inline-block;
  margin: 5px;
}

.mSection {
  max-width: fit-content;
  transition: 0.5s;
}

.flex_hori {
  display: flex;
  align-items: center;
  flex-direction: row;
  justify-content: space-around;
  text-align: center;
}
</style>
