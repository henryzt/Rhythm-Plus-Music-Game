<template>
  <transition name="modal-fade">
    <div class="modal-backdrop" v-if="showModal">
      <div class="modal blurBackground">
        <header class="modal-header">
          <slot name="header">
            {{titleText}}
            <div class="btn-action btn-close" @click="close">x</div>
          </slot>
        </header>
        <section class="modal-body">
          <slot>{{bodyText}}</slot>
        </section>
        <footer class="modal-footer">
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
        }
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


<style>
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
  width: 60%;
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

.modal-body {
  position: relative;
  padding: 20px 30px;
}

.btn-action {
  cursor: pointer;
  color: white;
  background: transparent;
  padding: 10px;
  min-width: 80px;
  margin: 0 10px;
  text-align: center;
  transition: 0.5s;
}

.btn-action:hover {
  color: gray;
  background: rgba(255, 255, 255, 0.527);
}

.btn-close {
  border: none;
  font-size: 20px;
  font-weight: bold;
  padding: 2px;
  margin: 0;
  min-width: 20px;
}

.modal-fade-enter,
.modal-fade-leave-active {
  transform: scale(1.2);
  opacity: 0;
}

.modal-fade-enter-active,
.modal-fade-leave-active {
  transition: 0.5s;
}
</style>
