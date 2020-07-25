<template>
  <div class="panel">
    <div style="padding-bottom: 5px;">
      <span>Edit Note Timing</span>
      <v-icon
        style="float: right; cursor: pointer;"
        name="times"
        scale="1.1"
        @click="$parent.noteToEdit = null"
      />
    </div>
    <div class="flex_hori">
      <v-icon
        class="btn-action btn-dark"
        name="minus"
        @click="minus(note, 't')"
      />
      <input step="0.01" v-model="note.t" placeholder="Time" type="number" />
      <v-icon class="btn-action btn-dark" name="plus" @click="add(note, 't')" />
      <div class="btn-action btn-dark btn-test" @click="testNote">Test</div>
    </div>
    <div>
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
    </div>
    <div v-if="note.h">
      <div style="padding-top: 20px;">Holding Notes</div>
      <div v-for="k in Object.keys(note.h)" :key="k" class="flex_hori">
        <div class="note">{{ k === " " ? "-" : k }}</div>
        <input
          step="0.01"
          v-model="note.h[k]"
          placeholder="End Time"
          type="number"
        />
        <div class="btn-action btn-dark btn-test" @click="removeHoldNote(k)">
          Remove
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import Vue from "vue";
import "vue-awesome/icons/minus";
import "vue-awesome/icons/times";

export default {
  name: "NoteEditPanel",
  props: ["note", "instance", "parent"],
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
        this.note.h = {};
      }
      if (!this.note.h[k]) this.note.h[k] = this.note.t + 0.2;
    },
    testNote(){
      this.instance.vm.disabled = true;
      const timeBefore = this.instance.currentTime;
      const selectedNotesBefore = this.instance.vm.selectedNotes;
      this.instance.vm.selectedNotes = [this.note];
      let seekTime = this.note.t - 1.5 > 0 ? this.note.t - 1.5 : 0;
      this.instance.vm.seekTo(seekTime);
      setTimeout(()=>{
      this.instance.resumeGame();
        setTimeout(()=>{
        let testInterval = setInterval(()=>{
          if(this.instance.currentTime < seekTime || !this.instance.isWithinTime(this.note) || this.instance.paused){
            clearInterval(testInterval);
            this.instance.vm.seekTo(timeBefore);
            this.instance.vm.selectedNotes = selectedNotesBefore;
            this.instance.vm.disabled = false;
          }
        }, 100)
      }, 1500)
      }, 200)
    }
  },
  watch: {
    "note.t"(val, oldVal) {
      // TODO why TF will html number input return string??????????????????
      if (this.note.h) {
        for (let key of Object.keys(this.note.h)) {
          this.note.h[key] =
            Number(this.note.h[key]) + Number(val) - Number(oldVal);
        }
      }
      this.note.t = Number(this.note.t);
      this.instance.repositionNotes();
    },
    "note.k"() {
      this.instance.repositionNotes();
    },
    "note.h"() {
      // TODO Again, WHY??
      if (this.note.h) {
        for (let key of Object.keys(this.note.h)) {
          this.note.h[key] = Number(this.note.h[key]);
        }
      }
      this.instance.repositionNotes();
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

.flex_hori {
  display: flex;
  align-items: center;
  flex-direction: row;
  justify-content: space-around;
  text-align: center;
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
