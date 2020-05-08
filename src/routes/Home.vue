<template>
   <div>
        Hello world
    </div>
</template>

<script>
import Visualizer from '../components/Visualizer.vue';



export default {
    name: 'Home',
    components: {
        Visualizer,
    },
    data(){
        return {
            audio: null,
            canvas: null,
            ctx: null,
        }
    },
    computed: {

    },
    watch: {

    },
    mounted() {


    },
    methods:{

    }
};
</script>

<style>
</style>
