<template>
  <div class="center" :style="{top:position}">
    <transition name="bounce" v-on:after-enter="enter">
      <div :class="classObj" v-if="display">
        <slot>{{text}}</slot>
      </div>
    </transition>
  </div>
</template>

<script>
export default {
    name: "ZoomText",
    data: ()=>{
        return {
            display: false,
            text: "Get Ready",
            position: "50%",
            duration: "1s",
            classObj: {}
        }
    },
    methods: {
        enter(){
            this.display = false;
        },
        show(text, position, classObj, duration){
            this.text = text;
            this.position = position ?? this.position;
            this.duration = duration ?? this.duration;
            if(classObj) this.classObj = { classObj };
           this.display = true;
        }
    }
}
</script>

<style scoped>
.center {
  top: 30%;
  width: 100%;
  height: 50%;
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 4em;
  font-weight: 800;
  pointer-events: none;
}

.bounce-enter-active {
  animation: bounce-in 1s;
}
.bounce-leave-active {
  animation: bounce-out 0.5s ease-out;
}
@keyframes bounce-in {
  0% {
    transform: scale(0);
    opacity: 0;
  }
  50% {
    opacity: 1;
  }
  100% {
    transform: scale(1);
  }
}

@keyframes bounce-out {
  0% {
    transform: scale(1);
    opacity: 1;
  }
  100% {
    opacity: 0;
    transform: scale(2);
  }
}
</style>