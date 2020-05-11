<template>
  <div>This is the audio Playback</div>
</template>

<script>
import fixAudioContext from '../helpers/fixAudioContext';
import axios from "axios"

export default {
    name: "AudioPlayback",
    props: [],
    data:function(){
        return {
            audioData:{
                audioCtx: null,
                src: null,
                analyser: null,
                bufferLength: null,
                dataArray: null
            },
        }
    },
    mounted(){
        // this.loadSong()
    },
    destroyed(){
        this.audioContext.close()
    },
    methods: {
        async loadSong(songSrc, loop){
            if(this.audioContext){
                this.audioContext.close()
            }
            // load audio file from server
            const response = await axios.get(songSrc, {
                responseType: 'arraybuffer',
            });
            // create audio context
            const audioContext =  new (window.AudioContext || window.webkitAudioContext);
            // create audioBuffer (decode audio file)
            // Safari doesn't know the promise based decodeAudioData. You will have to use callbacks.
            audioContext.decodeAudioData(response.data,(buffer)=>{
                // create audio source
                const source = audioContext.createBufferSource();
                source.buffer = buffer;
                source.connect(audioContext.destination);
                source.loop = loop;

                // play audio
                source.start();

                

                this.audioData.src = source;

                let analyser = audioContext.createAnalyser();
        
                source.connect(analyser);

                analyser.fftSize = 256;

                this.audioData.bufferLength = analyser.frequencyBinCount;

                this.audioData.dataArray = new Uint8Array(this.audioData.bufferLength);

                this.audioData.analyser = analyser;
                this.audioData.audioCtx = audioContext;

                //fix context on iOS
                fixAudioContext(this.audioData.audioCtx);
                

            });

        },
        stop(){
            this.audioData.src.stop()
        }
    }
}
</script>


<style scoped>
</style>