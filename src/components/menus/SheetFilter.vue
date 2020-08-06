<template>
  <div>
    <transition name="slide-fade" mode="out-in">
      <div class="flex_hori" key="1" v-if="!showSort">
        <div style="flex-grow: 1;"></div>
        <div class="clip">
          <span @click="showSearch = !showSearch">
            <v-icon name="search" />
            <span v-if="!showSearch" style="overflow: hidden;">Search</span>
          </span>
          <span>
            <transition name="width">
              <input
                class="search"
                v-if="showSearch"
                type="text"
                v-model="searchTerms"
              />
            </transition>
            <v-icon
              name="times"
              v-if="showSearch"
              @click="showSearch = false"
            />
          </span>
        </div>
        <div class="mSection flex_hori">
          <div class="clip" @click="showSort = !showSort">
            <v-icon name="sort-amount-down" />Sort
          </div>
        </div>
      </div>

      <div class="flex_hori" key="2" v-if="showSort">
        <div style="flex-grow: 1;"></div>
        <div class="clip clip_outlined" @click="sortByTitle">Title</div>
        <div class="clip clip_outlined" @click="sortByDate">Date</div>
        <div class="clip clip_outlined" @click="sortByArtist">Artist</div>
        <div class="clip" @click="showSort = false">
          <v-icon name="times" style="margin: 0;" />
        </div>
      </div>
    </transition>
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
      showSearch: false,
      searchTerms: null,
    };
  },
  mounted() {
    this.sortByTitle();
  },
  watch: {
    searchTerms() {
      if (!this.searchTerms) {
        this.$emit("sorted", this.songs);
        return;
      }
      const term = this.searchTerms;
      const isMatch = (s) => {
        return (
          s.title?.toLowerCase().includes(term) ||
          s.subtitle?.toLowerCase().includes(term) ||
          s.artist?.toLowerCase().includes(term)
        );
      };
      this.$emit("sorted", this.songs.filter(isMatch));
    },
    showSearch() {
      if (this.showSearch) {
        this.showSort = false;
      } else {
        this.searchTerms = null;
      }
    },
    showSort() {
      if (this.showSort) {
        this.showSearch = false;
      }
    },
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

.search {
  width: 180px;
  border: none !important;
  background: transparent;
  border-bottom: 1px solid silver !important;
  padding: 1px 5px;
  margin: 0 10px;
  transition: 0.5s;
}

.collapsed {
  width: 0;
  margin: 0;
  padding: 0;
}

.flex_hori {
  display: flex;
  align-items: center;
  flex-direction: row;
  justify-content: space-around;
  text-align: center;
}

.width-enter-active,
.width-leave-active,
.slide-fade-enter-active,
.slide-fade-leave-active {
  transition: all 0.3s ease;
}
.slide-fade-enter,
.slide-fade-leave-to {
  transform: translateY(30px);
  opacity: 0;
}

.width-enter,
.width-leave-to {
  width: 0;
  margin: 0;
  padding: 0;
  opacity: 0;
}
</style>
