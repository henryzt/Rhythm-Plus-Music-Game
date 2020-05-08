<template>
  <div class="wrap">
    <button class="button" @click="clicked">{{text}}</button>
  </div>
</template>


<script>

export default {
  name: 'Button',
  props: ["text"],
  data: function(){
    return {

    }
  },
  mounted() {

    },
  methods: {
    clicked(){
        this.$emit("click", null)
    }
  }
};
</script>

<style scoped>
/* ref https://codepen.io/mccombsc/pen/ZEzxWPy */

.wrap {
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  transform: scale(0.7);
}

.button {
  min-width: 300px;
  min-height: 60px;
  font-family: "Nunito", sans-serif;
  font-size: 22px;
  text-transform: uppercase;
  letter-spacing: 1.3px;
  font-weight: 700;
  color: #ffffff;
  background: rgb(221, 125, 0);
  background: linear-gradient(90deg, rgb(221, 125, 0) 0%, rgb(194, 61, 0) 100%);
  border: none;
  border-radius: 1000px;
  box-shadow: 12px 12px 24px rgba(238, 67, 0, 0.514);
  transition: all 0.3s ease-in-out 0s;
  cursor: pointer;
  outline: none;
  position: relative;
  padding: 10px;
}

button::before {
  content: "";
  border-radius: 1000px;
  min-width: calc(300px + 12px);
  min-height: calc(60px + 12px);
  border: 6px solid rgb(255, 145, 0);
  box-shadow: 0 0 60px rgba(255, 94, 0, 0.64);
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  opacity: 0;
  transition: all 0.3s ease-in-out 0s;
}

.button:hover,
.button:focus {
  color: #ffffff;
  transform: translateY(-6px);
}

button:hover::before,
button:focus::before {
  opacity: 1;
}

button::after {
  content: "";
  width: 30px;
  height: 30px;
  border-radius: 100%;
  border: 6px solid rgb(255, 166, 0);
  position: absolute;
  z-index: -1;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  animation: ring 1.5s infinite;
}

button:hover::after,
button:focus::after {
  animation: none;
  display: none;
}

@keyframes ring {
  0% {
    width: 30px;
    height: 30px;
    opacity: 1;
  }
  100% {
    width: 300px;
    height: 300px;
    opacity: 0;
  }
}
</style>