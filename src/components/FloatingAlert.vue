<template>
  <transition name="alert-fade">
    <div v-if="visible" class="horizontal" :class="[className]">{{text}}</div>
  </transition>
</template>

<script>
export default {
    name: "FloatingAlert",
    data: function(){
        return {
            visible: false,
            text: "This is a floating notification",
            className: ""
        }
    },
    methods: {
        show(text, time){
            this.visible = true;
            this.text = text;
            clearTimeout(this.hideTimeout)
            if(time && time!==0){
                this.hideTimeout = setTimeout(()=>{
                    this.visible = false;
                }, time)
            }
        },
        info(text){
            this.className="info"
            this.show(text)
        },
        warn(text){
            this.className="warn"
            this.show(text)
        },
        error(text){
            this.className="error"
            this.show(text)
        },
        success(text){
            this.className="success"
            this.show(text, 3500)
        }
    }

}
</script>

<style scoped>
.horizontal {
  position: fixed;
  top: 30px;
  left: 50%;
  transform: translateX(-50%);
  background: orange;
  padding: 20px;
  z-index: 1000;
}
.info {
  background: rgb(0, 120, 156);
}
.warn {
  background: orange;
}
.success {
  background: rgb(81, 134, 0);
}
.error {
  background: rgb(185, 0, 0);
}

.alert-fade-enter,
.alert-fade-leave-active {
  top: -50px;
  opacity: 0;
}

.alert-fade-enter-active,
.alert-fade-leave-active {
  transition: 0.5s;
}
</style>