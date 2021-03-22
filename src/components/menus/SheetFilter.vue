<template>
  <div class="animate__animated animate__fadeIn" v-if="songs">
    <transition name="slide-fade" mode="out-in">
      <div class="flex_hori" key="1" v-if="!showSort">
        <div class="flex_hori tags">
          <div class="flex_hori mobile_hide" v-if="!showAllTags">
            <div
              class="clip clip_outlined"
              @click="currentTag = null"
              :class="{ active: currentTag === null }"
            >
              All
            </div>
            <div v-for="tag in tags.slice(0, 3)" :key="tag">
              <div
                class="clip clip_outlined"
                @click="currentTag = tag"
                :class="{ active: currentTag === tag }"
              >
                {{ tag }}
              </div>
            </div>
          </div>
          <div class="clip clip_outlined" @click="showAllTags = !showAllTags">
            <v-icon name="angle-up" class="no-margin" v-if="showAllTags" />
            <v-icon name="angle-down" class="no-margin" v-else />
          </div>
        </div>
        <div class="flex_spacer"></div>
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
        <div class="flex_spacer"></div>
        <div class="clip clip_outlined" @click="sort('title', true)">
          <v-icon :name="sortIcon" v-if="currentSort == 'title'" />Title
        </div>
        <div class="clip clip_outlined" @click="sort('date', true)">
          <v-icon :name="sortIcon" v-if="currentSort == 'date'" />Date
        </div>
        <div class="clip clip_outlined" @click="sort('artist', true)">
          <v-icon :name="sortIcon" v-if="currentSort == 'artist'" />Artist
        </div>
        <div class="clip" @click="showSort = false">
          <v-icon name="times" class="no-margin" />
        </div>
      </div>
    </transition>

    <!-- all tags -->
    <div v-if="showAllTags">
      <v-bar
        :ops="{
          scrollPanel: {
            scrollingX: true,
          },
        }"
      >
        <div class="flex_hori all_tags">
          <div
            class="clip clip_outlined"
            @click="currentTag = null"
            :class="{ active: currentTag === null }"
          >
            All
          </div>
          <div v-for="tag in tags.slice(0, 100)" :key="tag">
            <div
              class="clip clip_outlined"
              @click="currentTag = tag"
              :class="{ active: currentTag === tag }"
            >
              {{ tag }}
            </div>
          </div>
        </div>
      </v-bar>
    </div>
  </div>
</template>

<script>
import { getTags } from "../../javascript/db";
import "vue-awesome/icons/search";
import "vue-awesome/icons/sort-amount-down";
import "vue-awesome/icons/times";
import "vue-awesome/icons/angle-down";
import "vue-awesome/icons/angle-up";
import "vue-awesome/icons/arrow-up";
import "vue-awesome/icons/arrow-down";

export default {
  name: "SheetFilter",
  props: ["songs"],
  data: function () {
    return {
      showSort: false,
      currentSort: "title",
      reverseSort: false,
      showSearch: false,
      searchTerms: null,
      tags: [],
      currentTag: null,
      showAllTags: false,
      filteredSongs: [],
    };
  },
  async mounted() {
    this.tags = await getTags();
    this.sort();
  },
  watch: {
    searchTerms() {
      this.playEffect("ui/click");
      this.sort();
    },
    showSearch() {
      this.playEffect("ui/click");
      if (this.showSearch) {
        this.showSort = false;
      } else {
        this.searchTerms = null;
      }
    },
    showSort() {
      this.playEffect("ui/click");
      if (this.showSort) {
        this.showSearch = false;
      }
    },
    showAllTags() {
      this.playEffect("ui/click");
    },
    currentTag() {
      this.playEffect("ui/slide2");
      this.sort();
    },
    songs() {
      this.sort();
    },
  },
  computed: {
    sortIcon() {
      return this.reverseSort ? "arrow-up" : "arrow-down";
    },
  },
  methods: {
    emitResult() {
      if (this.currentTag) {
        this.filteredSongs = this.filteredSongs.filter((e) =>
          e.tags.includes(this.currentTag)
        );
      }

      if (!this.searchTerms) {
        this.$emit("sorted", this.filteredSongs);
      } else {
        const term = this.searchTerms?.toLowerCase();
        const isMatch = (s) => {
          return (
            s.title?.toLowerCase().includes(term) ||
            s.subtitle?.toLowerCase().includes(term) ||
            s.artist?.toLowerCase().includes(term)
          );
        };
        this.$emit("sorted", this.filteredSongs.filter(isMatch));
      }
    },
    finishSort(sortName, changeReverse) {
      if (changeReverse) {
        if (this.currentSort === sortName) {
          this.reverseSort = !this.reverseSort;
        } else {
          this.reverseSort = false;
        }
      }
      if (this.reverseSort) this.filteredSongs.reverse();
      this.currentSort = sortName;
      this.emitResult();
    },
    sortByTitle() {
      this.filteredSongs.sort((a, b) => a.title.localeCompare(b.title));
    },
    sortByArtist() {
      this.filteredSongs.sort((a, b) => a.artist.localeCompare(b.artist));
    },
    sortByDate() {
      this.filteredSongs.sort(
        (a, b) => b.dateUpdated.seconds - a.dateUpdated.seconds
      );
    },
    sort(by, changeReverse) {
      if (!this.songs) return;
      this.filteredSongs = [...this.songs];
      const sortBy = by ?? this.currentSort;
      switch (sortBy) {
        case "title":
          this.sortByTitle();
          break;
        case "artist":
          this.sortByArtist();
          break;
        case "date":
          this.sortByDate();
          break;
      }
      this.finishSort(sortBy, changeReverse);
      if (changeReverse) {
        this.playEffect("ui/slide1");
      }
    },
    playEffect(effect) {
      this.$store.state.audio.playEffect(effect);
    },
  },
};
</script>

<style scoped>
.flex_hori {
  align-items: flex-start;
  justify-content: start;
}

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

.active {
  background: rgba(184, 184, 184, 0.3);
}

.tags {
  overflow: scroll;
}

.all_tags {
  overflow: scroll;
  max-width: 100%;
  width: 100%;
  margin-top: 10px;
  padding-bottom: 10px;
}

.fa-icon {
  vertical-align: middle;
  margin-right: 5px;
  margin-bottom: 1px;
}

.no-margin {
  margin: 0;
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

@media screen and (max-width: 600px) {
  .mobile_hide {
    display: none;
  }
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
