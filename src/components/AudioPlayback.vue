<template>
  <div>This is the audio Playback</div>
</template>

<script>
import fixAudioContext from '../helpers/fixAudioContext';
import axios from "axios"

export default {
    name: "AudioPlayback",
    props: ["songSrc"],
    data:function(){
        return {
            audioContext: null,
            source: null
        }
    },
    mounted(){
        this.loadSong()
    },
    destroyed(){
        this.audioContext.close()
    },
    methods: {
        async loadSong(){
            // load audio file from server
            const response = await axios.get(this.songSrc, {
                responseType: 'arraybuffer',
            });
            // create audio context
            const audioContext = this.audioContext ? this.audioContext : new (window.AudioContext || window.webkitAudioContext);
            // create audioBuffer (decode audio file)
            // Safari doesn't know the promise based decodeAudioData. You will have to use callbacks.
            audioContext.decodeAudioData(response.data,(buffer)=>{
                // create audio source
                const source = audioContext.createBufferSource();
                source.buffer = buffer;
                source.connect(audioContext.destination);

                // play audio
                source.start();
                this.audioContext = audioContext;
                this.source = source;

                //fix context on iOS
                fixAudioContext(this.audioContext);

                setTimeout(()=>{
                    console.log(this.source)
                    this.source.start();
                },5000)
            });

        }
    }
}
</script>


<style scoped>
</style>