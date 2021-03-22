<template>
  <div style="height: 73vh; display: flex; flex-direction: column;">
    <div class="tableHead">
      <div style="width: 10%;">
        <label class="cb_container cb_small">
          <input type="checkbox" v-model="selectedAll" @click="selectAll" />
          <span class="checkmark"></span>
        </label>
      </div>
      <div style="width: 25%;">Time</div>
      <div style="width: 55%;">Keys</div>
    </div>
    <div class="sheetTable">
      <virtual-list
        style="height: calc(100%); overflow-y: auto;"
        ref="table"
        :data-key="'t'"
        :data-sources="timeArrDisplay"
        :data-component="NoteTableItem"
        :extra-props="{ instance, noteToEdit, parent: $parent, table: this }"
      />
    </div>
    <div
      class="selectedIndicator"
      v-if="$parent.selectedNotes.length > 0 && !isBlinking"
    >
      <span>{{ $parent.selectedNotes.length }} notes selected</span>
      <a class="link" @click="clearSelected">Clear</a>
    </div>
    <NoteEditPanel
      v-if="noteToEdit"
      ref="panel"
      :note="noteToEdit"
      :instance="instance"
      :vm="$parent"
    ></NoteEditPanel>
    <div
      class="buttons"
      :class="{
        disabled: !instance.paused,
        disableChild: (!hasSelected || isBlinking) && instance.paused,
      }"
    >
      <a class="btn-action btn-dark anti-disable" @click="reorder">Reorder</a>
      <a class="btn-action btn-dark" @click="removeSelected">Delete</a>
      <a class="btn-action btn-dark" @click="selectBetween">Between</a>
      <a class="btn-action btn-dark" @click="clearSelected">Clear</a>
      <a class="btn-action btn-dark" @click="bulkEditNotes">Edit</a>
      <a class="btn-action btn-dark" @click="duplicateNote">Duplicate</a>
    </div>
    <div
      class="flex_hori"
      :class="{ disabled: !$parent.playMode && !instance.paused }"
    >
      <div style="flex-grow: 0.5;">
        <Checkbox
          label="Auto Follow"
          :model="this"
          modelKey="follow"
          cbStyle="form"
        ></Checkbox>
      </div>
      <a
        style="flex-grow: 0.4;"
        class="btn-action btn-dark"
        @click="scrollToCurrent"
        >Follow</a
      >
    </div>
  </div>
</template>

<script>
import NoteTableItem from "./NoteTableItem.vue";
import NoteEditPanel from "./NoteEditPanel.vue";
import Checkbox from "../ui/Checkbox.vue";
import VirtualList from "vue-virtual-scroll-list";

export default {
  name: "SheetTable",
  computed: {
    instance() {
      return this.$parent.instance;
    },
    hasSelected() {
      return this.$parent.selectedNotes.length !== 0;
    },
    timeArrDisplay() {
      return this.instance.timeArr.slice().reverse();
    },
  },
  components: {
    NoteEditPanel,
    VirtualList,
    Checkbox,
  },
  data() {
    return {
      selectedAll: false,
      follow: true,
      noteToEdit: null,
      isBlinking: false,
      NoteTableItem,
    };
  },
  watch: {
    "instance.timeArrIdx"() {
      if (!this.follow || (!this.$parent.playMode && !this.instance.paused)) {
        return;
      }
      this.scrollToCurrent();
    },
    "$parent.selectedNotes"() {
      this.selectedAll =
        this.$parent.selectedNotes.length !== 0 &&
        this.$parent.selectedNotes.length === this.instance.timeArr.length;
    },
    "instance.timeArr"() {
      if (this.instance.timeArr.length > 300 && !this.instance.paused) {
        this.$parent.disableMappingTable = true;
      }
    },
  },
  methods: {
    selectAll() {
      if (this.selectedAll) {
        this.clearSelected();
      } else {
        this.$parent.selectedNotes = this.instance.timeArr;
      }
    },
    clearSelected() {
      this.$parent.selectedNotes = [];
    },
    removeSelected() {
      if (this.$parent.selectedNotes == []) return;
      this.instance.timeArr = this.instance.timeArr.filter((el) => {
        return !this.$parent.selectedNotes.includes(el);
      });
      this.clearSelected();
      this.instance.repositionNotes();
      this.noteToEdit = null;
      this.$store.state.alert.success("Selected notes deleted");
    },
    scrollToCurrent() {
      const idx = this.instance.timeArr.length - this.instance.timeArrIdx - 1;
      const table = this.$refs.table;
      if (idx < this.instance.timeArr.length) {
        table.scrollToIndex(idx);
        table.scrollToOffset(table.getOffset() - 120);
      } else {
        table.scrollToTop();
      }
    },
    reorder() {
      this.$parent.reorderSheet();
      this.$parent.selectedNotes.sort(
        (a, b) => parseFloat(a.t) - parseFloat(b.t)
      );
    },
    selectBetween() {
      if (this.$parent.selectedNotes.length < 2) return;
      this.reorder();
      let sheet = this.instance.timeArr;
      const minIdx = sheet.indexOf(this.$parent.selectedNotes[0]);
      const maxIdx = sheet.indexOf(
        this.$parent.selectedNotes[this.$parent.selectedNotes.length - 1]
      );
      this.$parent.selectedNotes = sheet.slice(minIdx, maxIdx + 1);
    },
    setEditNote(note) {
      this.noteToEdit = null;
      this.$nextTick(() => {
        // re-render note edit panel
        this.noteToEdit = note;
      });
    },
    selectNoteToEdit(note) {
      this.setEditNote(note);
      let counter = 4;
      this.isBlinking = true;
      let blinkNoteInterval = setInterval(() => {
        const selectedIdx = this.$parent.selectedNotes.indexOf(note);
        if (selectedIdx !== -1) {
          this.$parent.selectedNotes.splice(selectedIdx, 1);
        } else {
          this.$parent.selectedNotes.push(note);
        }
        counter--;
        if (counter <= 0) {
          this.isBlinking = false;
          clearInterval(blinkNoteInterval);
        }
      }, 200);
    },
    bulkEditNotes() {
      if (!this.$parent.selectedNotes) return;
      if (this.$parent.selectedNotes.length > 1) {
        this.setEditNote(this.$parent.selectedNotes);
      } else {
        this.selectNoteToEdit(this.$parent.selectedNotes[0]);
      }
    },
    duplicateNote() {
      if (!this.$parent.selectedNotes) return;
      let newNoteArr = [];
      for (const note of this.$parent.selectedNotes) {
        const newNote = JSON.parse(JSON.stringify(note));
        newNoteArr.push(newNote);
      }
      this.instance.timeArr = this.instance.timeArr.concat(newNoteArr);
      this.$parent.selectedNotes = newNoteArr;
      this.reorder();
      this.instance.repositionNotes();
      // avoid overlay on top of the old ones
      this.bulkEditNotes();
      setTimeout(() => {
        this.$refs.panel.bulkTiming = 0.2;
        this.$refs.panel.bulkChange();
      }, 20);
    },
  },
};
</script>

<style scoped>
.sheetTable {
  flex-grow: 1;
  /* overflow: scroll; */
  overflow-y: auto;
  position: relative;
}

.tableHead {
  padding: 4px 0;
  text-align: left;
  width: 100%;
}

.tableHead div {
  padding: 1%;
  display: inline-block;
}

.buttons {
  padding-top: 5px;
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
}

.btn-dark {
  margin: 0;
  margin-top: 5px;
  margin-bottom: 5px;
  margin-right: 5px;
}

.buttons a {
  box-sizing: border-box;
  display: inline-block;
  cursor: pointer;
  /* padding: 10px; */
  width: 31%;
}

.cb_container .checkmark {
  background-color: transparent;
  border: 1px solid rgba(255, 255, 255, 0.5);
}

.flex_hori {
  justify-content: space-between;
}

.disableChild a {
  opacity: 0.3;
  pointer-events: none;
}

.disabled a {
  opacity: 0.3;
}

.anti-disable {
  opacity: 1 !important;
  pointer-events: all !important;
}

.selectedIndicator {
  background: rgb(192, 125, 0);
  text-align: center;
  padding: 5px;
}

.link {
  text-decoration: underline;
  cursor: pointer;
}
</style>
