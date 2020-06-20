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
            :class="{onScreen: instance.isWithinTime(entry.t), current:idx===instance.timeArrIdx}"
          >
            <td>
              <label class="cb_container cb_small">
                <input type="checkbox" v-model="$parent.selectedNotes" :value="entry" />
                <span class="checkmark"></span>
              </label>
            </td>
            <td @dblclick="seekTo(entry.t)">{{entry.t}}</td>
            <td>{{entry.k===" "?"-":entry.k}}</td>
          </tr>
          <tr class="last"></tr>
        </tbody>
      </table>
    </div>
    <div class="buttons" :class="{disabled: !instance.paused}">
      <a @click="reorder">Reorder</a>
      <a @click="removeSelected">Delete</a>
      <a @click="selectBetween">Select Between</a>
      <a @click="clearSelected">Clear</a>
    </div>
    <label class="cb_container cb_small">
      <input type="checkbox" v-model="follow" />
      <span class="checkmark"></span>
      Follow Current
    </label>
  </div>
</template>

<script>
export default {
    name: "SheetTable",
    computed: {
      instance(){
        return this.$parent.instance;
      },
    },
    data() {
      return {
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
                element?.scrollIntoView({block: "end", behavior: "smooth"})
            })
        },
        '$parent.selectedNotes'(){
          this.selectedAll = this.$parent.selectedNotes.length!==0 && this.$parent.selectedNotes.length===this.instance.timeArr.length;
        },
        'instance.timeArr'(){
          if(this.instance.timeArr.length>200 && !this.instance.paused){
            this.$parent.disableMappingTable = true;
          }
        }
    },
    methods:{
      selectAll(){
          if(this.selectedAll){
            this.clearSelected()
          }else{
            this.$parent.selectedNotes = this.instance.timeArr;
          }
      },
      clearSelected(){
        this.$parent.selectedNotes = []
      },
      removeSelected(){
        this.instance.timeArr = this.instance.timeArr.filter(( el ) => {
          return !this.$parent.selectedNotes.includes( el );
        } );
        this.clearSelected()
        this.instance.repositionNotes()
      },
      reorder(){
        this.$parent.reorderSheet()
        this.$parent.selectedNotes.sort((a,b) => parseFloat(a.t) - parseFloat(b.t))
      },
      selectBetween(){
        if(this.$parent.selectedNotes.length < 2) return;
        this.reorder()
        let sheet = this.instance.timeArr;
        const minIdx = sheet.indexOf(this.$parent.selectedNotes[0]);
        const maxIdx = sheet.indexOf(this.$parent.selectedNotes[this.$parent.selectedNotes.length-1]);
        this.$parent.selectedNotes = sheet.slice(minIdx, maxIdx + 1);
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
