<template>
  <div>
    <!-- no bg style -->
    <label v-if="cbStyle==='no-bg'" class="cb_container">
      {{label}}
      <input type="checkbox" v-model="model[modelKey]" />
      <span class="checkmark"></span>
    </label>
    <!-- form input style -->
    <label v-else class="cb_container input" style="width:100%;text-align:left;padding-left:40px;">
      <span style="font-size:14px;">{{label}}</span>
      <input type="checkbox" v-model="model[modelKey]" />
      <span class="checkmark" style="top:4px;left:4px;"></span>
    </label>
  </div>
</template>

<script>
export default {
    name:"Checkbox",
    props: ['label', 'model', 'modelKey', 'cbStyle']
}
</script>

<style scoped>
</style>