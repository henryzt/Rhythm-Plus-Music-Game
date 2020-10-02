<template>
  <div
    class="row"
    :class="{
      onScreen: instance.isWithinTime(note),
      current: index === instance.timeArr.length - instance.timeArrIdx - 1,
      editing: isEditing,
    }"
  >
    <div style="width: 10%;">
      <label class="cb_container cb_small">
        <input type="checkbox" v-model="parent.selectedNotes" :value="note" />
        <span class="checkmark"></span>
      </label>
    </div>
    <div style="width: 25%;" class="time" @click="seek(note)">
      {{ note.t }}
    </div>
    <div style="width: 55%;">
      <div class="keyWrapper" @click="edit(note)">
        <div
          v-for="k in instance.trackKeyBind"
          :key="k"
          :class="{
            activeNote: note.k.includes(k),
            holdNote: note.h && note.h[k],
          }"
        >
          {{ k === " " ? "-" : k }}
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: "NoteTableItem",
  props: ["index", "noteToEdit", "instance", "parent", "source", "table"],
  computed: {
    isEditing() {
      return (
        this.noteToEdit == this.note ||
        (Array.isArray(this.noteToEdit) && this.noteToEdit.includes(this.note))
      );
    },
    note() {
      return this.source;
    },
  },
  methods: {
    seek(note) {
      const follow = this.table.follow;
      this.table.follow = false;
      this.parent.smoothSeekTo(note.t + 0.1);
      setTimeout(() => {
        this.table.follow = follow;
      }, 100);
    },
    edit(note) {
      if (!this.instance.isWithinTime(note)) this.seek(note);
      this.table.selectNoteToEdit(note);
    },
  },
};
</script>

<style scoped>
.row {
  transition: 0.2s;
}

.row:hover {
  background-color: rgba(255, 255, 255, 0.3);
}

.row div {
  padding: 1%;
  display: inline-block;
}

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
}

.time {
  overflow: hidden;
  vertical-align: middle;
  cursor: pointer;
}

.activeNote {
  color: white !important;
}

.holdNote {
  text-decoration: underline;
  color: rgb(255, 249, 162) !important;
}

.onScreen {
  background-color: rgba(255, 255, 255, 0.1);
}

.current {
  background-color: rgba(66, 66, 66, 0.3);
}

.editing {
  background-color: rgba(145, 255, 0, 0.3);
  /* background-color: rgba(255, 196, 0, 0.596); */
}

.cb_container .checkmark {
  background-color: transparent;
  border: 1px solid rgba(255, 255, 255, 0.5);
}
</style>
