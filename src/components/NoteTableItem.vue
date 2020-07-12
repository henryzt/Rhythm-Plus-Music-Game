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
    <div style="width:25%" @dblclick="parent.seekTo(note.t)">{{note.t}}</div>
    <div style="width:55%">{{note.k===" "?"-":note.k}}</div>
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
  padding: 3px;
  display: inline-block;
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