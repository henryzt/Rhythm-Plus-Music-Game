<template>
  <div>
    <label class="cb_container input" style="width:100%;text-align:left;padding-left:40px;">
      <span style="font-size:14px;">{{label}}</span>
      <input type="checkbox" v-model="model.bind" />
      <span class="checkmark" style="top:4px;left:4px;"></span>
    </label>
  </div>
</template>

<script>
export default {
    name:"Checkbox",
    props: ['label', 'model']
}
</script>

<style scoped>
</style>