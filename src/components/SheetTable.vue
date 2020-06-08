<template>
  <div class="sheetTable" ref="table">
    <table>
      <thead>
        <tr>
          <th>Time</th>
          <th>Keys</th>
        </tr>
      </thead>
      <tbody>
        <tr
          v-for="(entry, idx) in instance.timeArr"
          :key="idx"
          :class="{current:idx===instance.timeArrIdx}"
        >
          <td>{{entry.t}}</td>
          <td>{{entry.k}}</td>
        </tr>
      </tbody>
    </table>
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
                element.scrollIntoView({block: "end"})
            })
        }
    }

}
</script>

<style scoped>
.sheetTable {
  max-height: 80%;
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
  transition: 0.5s;
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
</style>