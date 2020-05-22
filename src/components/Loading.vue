<template>
  <transition name="modal-fade">
    <div class="modal-backdrop" v-if="show">
      <div class="modal blurBackground">
        <section class="modal-body">
          <Loader color="white" style="display:inline;float:left" />
          <div style="margin-left: 50px;">
            <slot>{{text}}</slot>
          </div>
        </section>
      </div>
    </div>
  </transition>
</template>

<script>
import Loader from 'vue-spinner/src/FadeLoader.vue'

  export default {
    name: 'Modal',
    props: {
        text:{
            type: String,
            default: "Loading..."
        },
        show:{
            type: Boolean,
            default: false
        }
    },
    components:{
        Loader
    },
    data: function(){
        return {
        }
    },
    methods: {
    },
    watch:{
    }
  };
</script>


<style scoped>
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
  margin: 30px;
  max-width: 500px;
}

.modal-body {
  display: felx;
  padding: 30px;
}
</style>
