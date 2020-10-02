<template>
  <div class="panel">
    <!-- single note timing -->
    <div style="padding-bottom: 5px;">
      <span v-if="!isArrary">Edit Note Timing</span>
      <span v-else>Bulk Note Timing Edit</span>
      <v-icon
        style="float: right; cursor: pointer;"
        name="times"
        scale="1.1"
        @click="$parent.noteToEdit = null"
      />
    </div>
    <div v-if="!isArrary">
      <div class="flex_hori">
        <v-icon
          class="btn-action btn-dark"
          name="minus"
          @click="minus(note, 't')"
        />
        <input step="0.01" v-model="note.t" placeholder="Time" type="number" />
        <v-icon
          class="btn-action btn-dark"
          name="plus"
          @click="add(note, 't')"
        />
        <div class="btn-action btn-dark btn-test" @click="testNote">Test</div>
      </div>
      <div class="keyWrapper">
        <div
          v-for="k in instance.trackKeyBind"
          :key="k"
          :class="{ activeNote: note.k.includes(k) }"
          @click="toggleKey(k)"
          @dblclick="createHoldNote(k)"
        >
          {{ k === " " ? "-" : k }}
        </div>
      </div>
      <!-- hold note edit -->
      <div v-if="note.h">
        <div style="padding-top: 20px;">Holding Notes</div>
        <div v-for="k in Object.keys(note.h)" :key="k" class="flex_hori">
          <div class="note">{{ k === " " ? "-" : k }}</div>
          <input
            step="0.01"
            v-model="note.h[k]"
            placeholder="End Time"
            type="number"
            @change="markChanged"
          />
          <div class="btn-action btn-dark btn-test" @click="removeHoldNote(k)">
            Remove
          </div>
        </div>
      </div>
    </div>
    <!-- bulk note edit -->
    <div v-else class="flex_hori">
      <input
        style="flex-grow: 1;"
        step="0.01"
        v-model="bulkTiming"
        placeholder="Time"
        type="number"
      />
      <div class="btn-action btn-dark btn-test" @click="bulkChange">Apply</div>
    </div>
  </div>
</template>

<script>
import Vue from "vue";
import "vue-awesome/icons/minus";
import "vue-awesome/icons/times";

export default {
  name: "NoteEditPanel",
  props: ["note", "instance", "vm"],
  data: function () {
    return {
      bulkTiming: 0,
    };
  },
  computed: {
    isArrary() {
      return Array.isArray(this.note);
    },
  },
  methods: {
    // to remove tailing zeros
    add(target, att) {
      target[att] = Number((target[att] + 0.05).toFixed(3));
    },
    minus(target, att) {
      target[att] = Number((target[att] - 0.05).toFixed(3));
    },
    toggleKey(k) {
      if (this.note.k.includes(k)) {
        this.removeKey(k);
      } else {
        this.note.k = this.note.k.concat(k);
      }
    },
    removeKey(k) {
      this.note.k = this.note.k.replace(k, "");
      this.removeHoldNote(k);
    },
    removeHoldNote(k) {
      if (!this.note.h) return;
      // using js delete will not be reactive
      Vue.delete(this.note.h, k);
      if (Object.keys(this.note.h).length === 0) {
        Vue.delete(this.note, "h");
      }
      this.instance.repositionNotes();
    },
    createHoldNote(k) {
      if (!this.note.k.includes(k)) {
        this.toggleKey(k);
      }
      if (!this.note.h) {
        Vue.set(this.note, "h", {});
      }
      if (!this.note.h[k]) Vue.set(this.note.h, k, this.note.t + 0.2);
      // reactivity in depth https://vuejs.org/v2/guide/reactivity.html
    },
    testNote() {
      this.vm.disabled = true;
      const timeBefore = this.instance.currentTime;
      const selectedNotesBefore = this.vm.selectedNotes;
      this.vm.selectedNotes = [this.note];
      let seekTime = this.note.t - 1.5 > 0 ? this.note.t - 1.5 : 0;
      this.vm.seekTo(seekTime);
      setTimeout(() => {
        this.instance.resumeGame();
        setTimeout(() => {
          let testInterval = setInterval(() => {
            if (
              this.instance.currentTime < seekTime ||
              !this.instance.isWithinTime(this.note) ||
              this.instance.paused
            ) {
              clearInterval(testInterval);
              this.vm.seekTo(timeBefore);
              this.vm.selectedNotes = selectedNotesBefore;
              this.vm.disabled = false;
            }
          }, 100);
        }, 1500);
      }, 200);
    },
    markChanged() {
      this.vm.sheetChanged = true;
    },
    moveHoldNote(note, diff) {
      if (note.h) {
        for (let key of Object.keys(note.h)) {
          note.h[key] = Number(note.h[key]) + diff;
        }
      }
    },
    bulkChange() {
      const diff = Number(this.bulkTiming);
      const arr = this.isArrary ? this.note : [this.note];
      for (const note of arr) {
        this.moveHoldNote(note, diff);
        note.t += diff;
      }
      this.bulkTiming = 0;
      this.instance.repositionNotes();
      this.markChanged();
    },
  },
  watch: {
    "note.t"(val, oldVal) {
      // TODO why TF will html number input return string??????????????????
      this.moveHoldNote(this.note, Number(val) - Number(oldVal));
      this.note.t = Number(this.note.t);
      this.instance.repositionNotes();
      this.markChanged();
    },
    "note.k"() {
      this.instance.repositionNotes();
      this.markChanged();
    },
    "note.h"() {
      // TODO Again, WHY??
      if (this.note.h) {
        for (let key of Object.keys(this.note.h)) {
          this.note.h[key] = Number(this.note.h[key]);
        }
      }
      this.instance.repositionNotes();
      this.markChanged();
    },
  },
};
</script>

<style scoped>
.keyWrapper {
  width: 100%;
  display: inline-flex !important;
  cursor: pointer;
}

.keyWrapper div {
  display: inline-block;
  flex: 1 100%;
  text-align: center;
  margin-right: -1px;
  color: rgb(68, 68, 68);
  border: 1px solid rgb(68, 68, 68);
  line-height: 25px;
}

.activeNote {
  background: yellow;
}

.panel {
  padding: 20px 0;
  border-bottom: 1px solid rgba(128, 128, 128, 0.5);
  border-top: 1px solid rgba(128, 128, 128, 0.5);
}

.flex_hori input {
  width: 30%;
  text-align: center;
}

.btn-dark {
  min-width: 10%;
  flex-grow: 0.5;
  height: 12.5px;
}

.btn-test {
  margin-left: 5px;
  flex-grow: 1;
}

.note {
  display: block;
  color: yellow;
  border: 1px solid yellow;
  opacity: 0.5;
  flex: 1 20%;
  margin-right: 5px;
  line-height: 30px;
}
</style>
