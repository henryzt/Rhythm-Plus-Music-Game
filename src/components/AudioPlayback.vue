<template>
  <div>This is the audio Playback</div>
</template>

<script>
import fixAudioContext from '../helpers/fixAudioContext';
import axios from "axios"
import {Howl, Howler} from 'howler';

export default {
    name: "AudioPlayback",
    props: [],
    data:function(){
        return {
            audioData:{
                audioCtx: null,
                analyser: null,
                bufferLength: null,
                dataArray: null
            },
            player: null
        }
    },
    mounted(){
        // this.loadSong()
    },
    destroyed(){
        
    },
    methods: {
        async loadSong(songSrc, loop){
                if(this.player)
                    this.player.unload()

                this.player = new Howl({
                    src: [songSrc],
                    loop: loop
                });
                
                // ref https://stackoverflow.com/questions/32460123/connect-analyzer-to-howler-sound

                // Create an analyser node in the Howler WebAudio context
                let analyser = Howler.ctx.createAnalyser();

                // Connect the masterGain -> analyser (disconnecting masterGain -> destination)
                Howler.masterGain.connect(analyser);

                analyser.fftSize = 256;

                this.audioData.bufferLength = analyser.frequencyBinCount;

                this.audioData.dataArray = new Uint8Array(this.audioData.bufferLength);

                this.audioData.analyser = analyser;
                this.audioData.audioCtx = Howler.ctx;

                this.player.play();

        },
        stop(){
            this.player.stop()
        }
    }
}
</script>


<style scoped>
</style>