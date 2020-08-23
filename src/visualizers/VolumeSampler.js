export default class VolumeSampler {
  constructor(audioData) {
    const sampleAudioStream = () => {
      if (!audioData.analyser)
        return;
      audioData.analyser.getByteFrequencyData(audioData.dataArray);
      // calculate an overall volume value
      let total = 0;
      for (let i = 0; i < 50; i++) {
        // get the volume from the first 50 bins, else it gets too loud with treble
        total += audioData.dataArray[i];
      }
      this.volume = total;
    };
    this.interval = setInterval(sampleAudioStream, 20);
    // public properties and methods
    this.volume = 0;
    // this.streamData = new Uint8Array(128);
  }
  destroy() {
    clearInterval(this.interval);
  };
}
;
