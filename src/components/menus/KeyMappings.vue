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
          <td @click="reset" class="k reset"><v-icon name="redo"></v-icon></td>
        </tr>
      </tbody>
    </table>

    <Modal
      style="z-index: 1000; text-align: center;"
      ref="modal"
      okText="Done"
      :showOk="newKey != null"
    >
      <template v-slot:header>
        <div style="width: 100%; font-size: 1.3em;">
          Key Remap
        </div>
      </template>

      <template>
        <div class="press" v-if="!newKey">Press a key now</div>
        <div class="newKey" v-else>{{ newKey }}</div>
        <div v-if="collide">This key could collide with others</div>
        <input
          autofocus="true"
          ref="input"
          style="opacity: 0; width: 0;"
          v-model="newKey"
        />
      </template>
    </Modal>
  </div>
</template>

<script>
import Modal from "../ui/Modal.vue";
import "vue-awesome/icons/redo";

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
      collide: false,
    };
  },
  computed: {
    m() {
      return this.value ?? defaultMapping;
    },
  },
  watch: {
    newKey() {
      if (!this.newKey) return;
      if (this.newKey.length > 1) {
        this.newKey = this.newKey.slice(-1);
      }
      this.newKey = this.newKey.toLowerCase();
      this.collide = Object.values(this.m).includes(this.newKey);
    },
  },
  mounted() {},
  methods: {
    async change(key) {
      this.newKey = null;
      this.collide = null;
      this.$refs.modal.show().then((done) => {
        if (done && this.newKey) {
          const newMappings = Object.assign(this.m, { [key]: this.newKey });
          this.$emit("input", newMappings);
        }
      });
      setTimeout(() => {
        this.$refs.input.focus();
        this.$refs.input.onblur = () => {
          this.$refs.input?.focus();
        };
      }, 100);
    },
    async reset() {
      const doReset = await this.$store.state.gModal.show({
        bodyText: "Reset key mappings to default?",
        okText: "Reset",
        type: "warning",
      });
      if (doReset) this.$emit("input", defaultMapping);
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

.reset {
  background: rgba(128, 128, 128, 0.1);
}

.newKey {
  font-size: 2.5em;
  font-weight: bolder;
  padding-bottom: 15px;
}

.press {
  font-size: 1.2em;
  font-weight: bolder;
  padding: 15px;
}
</style>
