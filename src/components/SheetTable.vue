<template>
  <div style="height:100%">
    <div class="sheetTable" ref="table">
      <table>
        <thead>
          <tr>
            <th>
              <label class="cb_container cb_small">
                <input type="checkbox" v-model="selectedAll" @click="selectAll" />
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
            :class="{onScreen:$parent.playMode && isWithinTime(entry.t), current:idx===instance.timeArrIdx}"
            @dblclick="seekTo(entry.t)"
          >
            <td>
              <label class="cb_container cb_small">
                <input type="checkbox" v-model="selectedNotes" :value="entry" />
                <span class="checkmark"></span>
              </label>
            </td>
            <td>{{entry.t}}</td>
            <td>{{entry.k==" "?"-":entry.k}}</td>
          </tr>
          <tr class="last"></tr>
        </tbody>
      </table>
    </div>
    <div class="buttons">
      <a @click="reorder">Reorder</a>
      <a @click="selectBetween">Select Between</a>
      <a @click="removeSelected">Delete</a>
      <a @click="clearSelected">Clear</a>
      <label class="cb_container cb_small">
        <input type="checkbox" v-model="follow" />
        <span class="checkmark"></span>
        Follow Current
      </label>
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
    data() {
      return {
        selectedNotes: [],
        selectedAll: false,
        follow: true
      }
    },
    watch: {
        'instance.timeArrIdx'(){
            if(!this.follow) return;
            this.$nextTick(()=>{
                let element = this.$el.querySelector(".current");
                if(!element) element = this.$el.querySelector(".last");
                element.scrollIntoView({block: "end", behavior: "smooth"})
            })
        },
        selectedNotes(){
          this.selectedAll = this.selectedNotes.length!==0 && this.selectedNotes.length===this.instance.timeArr.length;
        }
    },
    methods:{
      isWithinTime(time){
        const sec = Number(this.$parent.noteSpeedInSec);
        const current = Number(this.$parent.currentTime);
        return time <= current + sec && time >= current;
      },
      selectAll(){
          if(this.selectedAll){
            this.clearSelected()
          }else{
            this.selectedNotes = this.instance.timeArr;
          }
      },
      clearSelected(){
        this.selectedNotes = []
      },
      removeSelected(){
        this.instance.timeArr = this.instance.timeArr.filter(( el ) => {
          return !this.selectedNotes.includes( el );
        } );
        this.clearSelected()
      },
      reorder(){
        this.$parent.reorderSheet()
        this.selectedNotes.sort((a,b) => parseFloat(a.t) - parseFloat(b.t))
      },
      selectBetween(){
        if(this.selectedNotes.length < 2) return;
        this.reorder()
        let sheet = this.instance.timeArr;
        const minIdx = sheet.indexOf(this.selectedNotes[0]);
        const maxIdx = sheet.indexOf(this.selectedNotes[this.selectedNotes.length-1]);
        this.selectedNotes = sheet.slice(minIdx, maxIdx + 1);
      },
      seekTo(t){
        this.$parent.seekTo(t)
      }
    }

}
</script>

<style scoped>
.sheetTable {
  height: 75%;
  overflow: scroll;
  position: relative;
}

table {
  width: 100%;
  border-collapse: collapse;
}

th {
  height: 30px;
  text-align: left;
  background-color: #0b0b0b !important;
  position: sticky;
  top: 0;
  z-index: 30;
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

.onScreen {
  background-color: rgba(255, 255, 255, 0.1);
}

.current {
  background-color: rgba(145, 255, 0, 0.3);
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