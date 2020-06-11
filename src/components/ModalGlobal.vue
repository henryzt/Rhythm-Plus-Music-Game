<template>
  <Modal
    style="z-index:1000"
    :okText="okText"
    :cancelText="cancelText"
    :titleText="titleText"
    :bodyText="bodyText"
    :showCancel="showCancel"
    @ok="okCallback"
    @close="cancelCallback"
    ref="globalModal"
  ></Modal>
</template>

<script>
import Modal from './Modal.vue';
  export default {
    name: 'ModalGlobal',
    props: [],
    components:{
        Modal
    },
    data: function(){
        return {
            okText: undefined,
            cancelText: undefined,
            titleText: undefined,
            bodyText: undefined,
            showCancel: true,
            okCallback: ()=>{},
            cancelCallback: ()=>{}
        }
    },
    methods: {
        show(options){
            if(options.okText) this.okText = options.okText;
            if(options.cancelText) this.cancelText = options.cancelText;
            if(options.bodyText) this.bodyText = options.bodyText;
            if(options.titleText) this.titleText = options.titleText;
            if(options.showCancel) this.showCancel = options.showCancel;
            if(options.okCallback) this.okCallback = options.okCallback;
            if(options.cancelCallback) this.cancelCallback = options.cancelCallback;
            if(options.isError) this.titleText = "Error";
            this.$refs.globalModal.show()
        }
    },
    mounted(){
    },
    watch:{
    }
  };
</script>


<style scoped>
</style>
