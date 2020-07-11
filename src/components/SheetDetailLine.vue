<template>
  <div>
    <div class="compact" v-if="compact">
      <div class="sBlock">
        <span class="clip">{{getDifficulty(sheet.difficulty)}}</span>
      </div>
      <div class="sBlock">{{getLengthFormatted(sheet.length)}}</div>
      <div class="sBlock">{{sheet.keys}}Key</div>
      <div class="sBlock">{{sheet.noteCount}} Notes</div>
    </div>
    <div class="detailed" v-else>
      <div class="sBlock">
        <span class="clip">Status</span>
        {{sheet.visibility}}
      </div>
      <div class="sBlock" v-if="sheet.dateCreated">
        <span class="clip">Date Created</span>
        {{sheet.dateCreated.seconds | moment('from')}}
      </div>
      <div class="sBlock">
        <span class="clip">Difficulty</span>
        {{getDifficulty(sheet.difficulty)}}
      </div>
      <div class="sBlock">
        <span class="clip">Key</span>
        {{sheet.keys}} Keys
      </div>
      <div class="sBlock">
        <span class="clip">Note Count</span>
        {{sheet.noteCount}}
      </div>
      <div class="sBlock">
        <span class="clip">Length</span>
        {{getLengthFormatted(sheet.length)}}
      </div>
      <div class="sBlock" v-if="sheet.title">
        <span class="clip">Sheet Name</span>
        {{sheet.title}}
      </div>
    </div>
  </div>
</template>

<script>
export default {
    name: "SheetDetailLine",
    props: ["sheet", "compact"],
    methods:{
        getDifficulty(diff){
            if(!diff) return "Unkown";
            return diff + " · " + ((diff > 9)?"Expert":((diff > 6)?"Hard":((diff > 3)?"Normal":"Easy")));
        },
        getLengthFormatted(sec){
            if(!sec) return "";
            return new Date(sec * 1000).toISOString().substr(14, 5);
        }
    }
}
</script>

<style scoped>
.clip {
  background: rgba(184, 184, 184, 0.5);
  padding: 3px 10px;
  border-radius: 20px;
  font-size: 14px;
}
.sBlock {
  display: inline-block;
  margin: 5px;
}
.compact {
  max-width: 100%;
  overflow: scroll;
  white-space: nowrap;
  margin: 0 10px;
}
.detailed {
  text-align: left;
  overflow: scroll;
  padding: 5px 0;
}
</style>