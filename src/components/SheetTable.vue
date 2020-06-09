<template>
  <div style="height:100%">
    <div class="sheetTable" ref="table">
      <table>
        <thead>
          <tr>
            <th>
              <label class="cb_container cb_small">
                <input type="checkbox" />
                <span class="checkmark"></span>
              </label>
            </th>
            <th>Time</th>
            <th>Keys</th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="(entry, idx) in instance.timeArr"
            :key="idx"
            :class="{onScreen:isWithinTime(entry.t), current:idx===instance.timeArrIdx}"
          >
            <td>
              <label class="cb_container cb_small">
                <input type="checkbox" />
                <span class="checkmark"></span>
              </label>
            </td>
            <td>{{entry.t}}</td>
            <td>{{entry.k==" "?"-":entry.k}}</td>
          </tr>
        </tbody>
      </table>
    </div>
    <div class="buttons">
      <a @click="$parent.reorderSheet">Reorder</a>
      <a>Select Between</a>
      <a>Delete</a>
      <a>Delete After</a>
      <a>Clear</a>
    </div>
  </div>
</template>

<script>
export default {
    name: "SheetTable",
    computed: {
      instance(){
        return this.$parent.instance;
      }
    },
    watch: {
        'instance.timeArrIdx'(){
            this.$nextTick(()=>{
                let element = this.$el.querySelector(".current");
                if(!element) return;
                element.scrollIntoView({block: "end"})
            })
        },
    },
    methods:{
      isWithinTime(time){
        const sec = Number(this.$parent.noteSpeedInSec);
        const current = Number(this.$parent.currentTime);
        return time <= current + sec && time >= current;
      }
    }

}
</script>

<style scoped>
.sheetTable {
  height: 80%;
  overflow: scroll;
}

table {
  width: 100%;
  border-collapse: collapse;
}

th {
  height: 30px;
  text-align: left;
}

thead {
  position: sticky;
  top: 0;
}

tr {
  transition: 0.2s;
}

tr:hover {
  background-color: rgba(255, 255, 255, 0.3);
}

th,
td {
  padding: 3px;
}

.current {
  background-color: rgba(145, 255, 0, 0.3);
}

.onScreen {
  background-color: rgba(255, 255, 255, 0.1);
}

.buttons {
  padding: 10px;
  overflow: scroll;
}

.buttons a {
  box-sizing: border-box;
  display: inline-block;
  cursor: pointer;
  padding: 10px;
}

.cb_container .checkmark {
  background-color: transparent;
  border: 1px solid rgba(255, 255, 255, 0.5);
}
</style>