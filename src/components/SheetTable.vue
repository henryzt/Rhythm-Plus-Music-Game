<template>
  <div style="height:100%">
    <div class="tableHead">
      <div style="width:10%">
        <label class="cb_container cb_small">
          <input type="checkbox" v-model="selectedAll" @click="selectAll" />
          <span class="checkmark"></span>
        </label>
      </div>
      <div style="width:25%">Time</div>
      <div style="width:55%">Keys</div>
    </div>
    <div class="sheetTable" ref="table">
      <div>
        <div v-for="(entry, idx) in instance.timeArr" :key="idx">
          <NoteTableItem :note="entry" :idx="idx" :instance="instance" :parent="$parent"></NoteTableItem>
        </div>
        <div class="last"></div>
      </div>
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
import NoteTableItem from './NoteTableItem.vue';

export default {
    name: "SheetTable",
    computed: {
      instance(){
        return this.$parent.instance;
      },
    },
    components:{
      NoteTableItem
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
        if(this.$parent.selectedNotes == []) return;
        this.instance.timeArr = this.instance.timeArr.filter(( el ) => {
          return !this.$parent.selectedNotes.includes( el );
        } );
        this.clearSelected()
        this.instance.repositionNotes()
        this.$store.state.alert.success("Selected notes deleted")
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
      }
    }

}
</script>

<style scoped>
.sheetTable {
  height: 70%;
  overflow: scroll;
  position: relative;
}

.tableHead {
  padding: 4px 0;
  text-align: left;
  width: 100%;
}

.tableHead div {
  padding: 3px;
  display: inline-block;
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
