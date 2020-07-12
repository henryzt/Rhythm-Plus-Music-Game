<template>
  <div
    class="row"
    :class="{onScreen: instance.isWithinTime(note.t), current:idx===instance.timeArrIdx}"
  >
    <div style="width:10%">
      <label class="cb_container cb_small">
        <input type="checkbox" v-model="parent.selectedNotes" :value="note" />
        <span class="checkmark"></span>
      </label>
    </div>
    <div style="width:25%;overflow:hidden;" @dblclick="parent.seekTo(note.t)">{{note.t}}</div>
    <div style="width:55%">
      <div class="keyWrapper" @click="$emit('select', note)">
        <div
          v-for="k in instance.trackKeyBind"
          :key="k"
          :class="{activeNote:note.k.includes(k), holdNote:note.h&&note.h[k]}"
        >{{k===" "?"-":k}}</div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
    name:'NoteTableItem',
    props:['note', 'idx', 'instance', 'parent']

}
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
  background-color: rgba(145, 255, 0, 0.3);
}

.cb_container .checkmark {
  background-color: transparent;
  border: 1px solid rgba(255, 255, 255, 0.5);
}
</style>