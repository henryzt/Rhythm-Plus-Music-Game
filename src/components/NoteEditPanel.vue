<template>
  <div class="panel">
    <div style="padding-bottom:5px;">
      <span>Edit Note Timing</span>
      <v-icon style="float:right" name="times" scale="1.1" />
    </div>
    <div class="flex_hori">
      <v-icon class="btn-action btn-dark" name="minus" @click="minus(note,'t')" />
      <input step="0.01" v-model="note.t" placeholder="Time" type="number" />
      <v-icon class="btn-action btn-dark" name="plus" @click="add(note,'t')" />
      <div class="btn-action btn-dark btn-test">Test</div>
    </div>
    <div>
      <div class="keyWrapper">
        <div
          v-for="k in instance.trackKeyBind"
          :key="k"
          :class="{activeNote:note.k.includes(k)}"
          @click="toggleKey(k)"
        >{{k===" "?"-":k}}</div>
      </div>
    </div>
  </div>
</template>

<script>
import 'vue-awesome/icons/minus'
import 'vue-awesome/icons/times'

export default {
    name:'NoteEditPanel',
    props:['note', 'instance', 'parent'],
    methods: {
        // to remove tailing zeros
        add(target, att){
            target[att] = Number((target[att]+0.05).toFixed(3));
        },
        minus(target, att){
            target[att] = Number((target[att]-0.05).toFixed(3));
        },
        toggleKey(k){
            if(this.note.k.includes(k)){
                this.removeKey(k)
            }else{
                this.note.k = this.note.k.concat(k);
            }
        },
        removeKey(k){
            this.note.k = this.note.k.replace(k,"");
        }

    },
    watch:{
        'note.t'(){
            this.instance.repositionNotes()
        }
    }

}
</script>

<style scoped>
.keyWrapper {
  width: 100%;
  display: inline-flex !important;
}

.keyWrapper div {
  display: inline-block;
  flex: 1 100%;
  text-align: center;
  margin-right: -1px;
  color: rgb(68, 68, 68);
  border: 1px solid rgb(68, 68, 68);
  line-height: 25px;
  cursor:pointer;
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

.flex_hori input{
    width:30%;text-align:center;
}

.btn-dark{
    min-width:10%;
    flex-grow: 0.5;
    height: 12.5px;
}

.btn-test{
    margin-left:5px;flex-grow:1
}
</style>