<template>
  <transition name="modal-fade">
    <div class="modal-backdrop" v-if="showModal">
      <div class="modal blurBackground">
        <header class="modal-header" :class="{'modal-darker':hideFooter}">
          <slot name="header">
            {{titleText}}
            <div class="btn-action btn-close" @click="close">x</div>
          </slot>
        </header>
        <section class="modal-body">
          <slot>{{bodyText}}</slot>
        </section>
        <footer class="modal-footer" v-if="!hideFooter">
          <slot name="footer">
            <div class="btn-action" @click="ok">{{okText}}</div>
            <div class="btn-action" @click="close">{{cancelText}}</div>
          </slot>
        </footer>
      </div>
    </div>
  </transition>
</template>

<script>
  export default {
    name: 'Modal',
    props: {
        okText:{
            type: String,
            default: "OK"
        },
        cancelText:{
            type: String,
            default: "Cancel"
        },
        titleText:{
            type: String,
            default: "Alert"
        },
        bodyText:{
            type: String,
            default: ""
        },
        hideFooter:{
            type: Boolean,
            default: false
        },
    },
    data: function(){
        return {
            showModal: false
        }
    },
    methods: {
        show(){
            this.showModal = true
        },
        ok() {
            this.showModal = false
            this.$emit('ok');
        },
        close() {
            this.showModal = false
            this.$emit('close');
        },
    },
    watch:{
    }
  };
</script>


<style scoped>
/* part ref https://www.digitalocean.com/community/tutorials/vuejs-vue-modal-component */
.modal-backdrop {
  position: fixed;
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;
  background-color: rgba(0, 0, 0, 0.7);
  display: flex;
  justify-content: center;
  align-items: center;
}

.modal {
  background: rgba(255, 255, 255, 0.5);
  overflow-x: auto;
  display: flex;
  flex-direction: column;
  width: 80%;
  max-width: 500px;
}

.modal-header,
.modal-footer {
  padding: 15px;
  display: flex;
}

.modal-header {
  color: #ffffff;
  justify-content: space-between;
}

.modal-footer {
  background: rgba(114, 114, 114, 0.4);
  justify-content: flex-end;
}

.modal-darker {
  background: rgba(114, 114, 114, 0.4);
}

.modal-body {
  position: relative;
  padding: 20px 30px;
}
</style>
