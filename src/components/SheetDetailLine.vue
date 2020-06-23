<template>
  <div style="text-align:left">
    <div class="sBlock">
      <span class="clip">Difficulty</span>
      {{sheet.difficulty}}
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
      {{sheet.length}} s
    </div>
    <div class="sBlock" v-if="sheet.title">
      <span class="clip">Sheet Name</span>
      {{sheet.title}}
    </div>
  </div>
</template>

<script>
export default {
    name: "SheetDetailLine",
    props: ["sheet"],
    methods:{
        
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
</style>