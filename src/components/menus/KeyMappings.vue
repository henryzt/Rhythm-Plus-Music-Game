<template>
  <div>
    <table>
      <tbody>
        <tr>
          <td @click="change('a')" class="k s">{{ m["a"] }}</td>
          <td @click="change('s')" class="k s">{{ m["s"] }}</td>
          <td @click="change('d')" class="k">{{ m["d"] }}</td>
          <td @click="change('f')" class="k">{{ m["f"] }}</td>
          <td></td>
          <td @click="change('j')" class="k">{{ m["j"] }}</td>
          <td @click="change('k')" class="k">{{ m["k"] }}</td>
          <td @click="change('l')" class="k s">{{ m["l"] }}</td>
          <td @click="change(';')" class="k s">{{ m[";"] }}</td>
        </tr>
        <tr>
          <td></td>
          <td></td>
          <td></td>
          <td @click="change(' ')" colspan="3" class="k">{{ m[" "] }}</td>
          <td></td>
          <td></td>
          <td></td>
        </tr>
      </tbody>
    </table>

    <Modal
      style="z-index: 1000;"
      ref="modal"
      okText="Done"
      :showOk="newKey != null"
    >
      <template v-slot:header>
        <div style="text-align: center; width: 100%; font-size: 23px;">
          Key Remap
        </div>
      </template>

      <template>
        <div v-if="!newKey">Press a key now</div>
        <div v-else>{{ newKey }}</div>
        <input autofocus="true" style="visibility: hidden;" v-model="newKey" />
      </template>
    </Modal>
  </div>
</template>

<script>
import Modal from "../ui/Modal.vue";

const defaultMapping = {
  a: "a",
  s: "s",
  d: "d",
  f: "f",
  " ": " ",
  j: "j",
  k: "k",
  l: "l",
  ";": ";",
};

export default {
  name: "KeyMappings",
  props: ["value"],
  components: {
    Modal,
  },
  data() {
    return {
      newKey: null,
    };
  },
  computed: {
    m() {
      return this.value ?? defaultMapping;
    },
  },
  mounted() {},
  methods: {
    async change(key) {
      this.newKey = null;
      const done = await this.$refs.modal.show();
      if (done && this.newKey) {
        const newMappings = Object.assign(this.m, { [key]: this.newKey });
        this.$emit("input", newMappings);
      }
    },
  },
};
</script>

<style scoped>
table {
  width: 100%;
}

td {
  width: 48px;
  height: 48px;
  background: rgba(128, 128, 128, 0.1);
}

.k {
  background: rgb(83, 83, 83);
  text-align: center;
  transition: all 1s;
  cursor: pointer;
}

.k:hover {
  background: #a5a5a5;
}

.s {
  /* secondary */
  background: rgba(83, 83, 83, 0.6);
}
</style>
