<template>
  <canvas ref="visualizerCanvas"></canvas>
</template>

<script>

export default {
    name: 'ColorPoly',
    props: ["audioData"],
    data: function(){
        return {
            canvas: null,
            ctx: null
        }
    },
    mounted() {
        this.canvas = this.$refs.visualizerCanvas;
        this.ctx = this.canvas.getContext("2d");
        Visualiser.initialize(this.canvas,this.ctx,this.audioData.analyser, this.audioData.dataArray)
        Visualiser.animationLoop()
    },
    beforeDestroy(){
        clearTimeout(Visualiser.animationLoopTimeOutId);
        Visualiser.clearLevels();
    },
    methods: {
        update() {
        },
        resizeCanvas(){
            Visualiser.resize()
        }
    },
};
// based on http://inmosystems.com/blog/html5-canvas-and-the-web-audio-api

      let Visualiser = {
        Shape1: true,
        Sides1: 6,
        Shape2: false,
        Sides2: 8,
        Perspective: 10,
        ColorCycle: true,
        Hyper: true,
        StepInc: 24,
        NumShapes: 48,
        FPS: 24,
        /**
         * Initialize Visualiser related items
         */
        initialize: function (canvas, ctx, analyser, dataArr) {
          this.Canvas = canvas;
          this.Context = ctx;
          this.Analyser = analyser;
          this.Data = dataArr;

          var Index;
          this.resize();
          // Set cycle frequency, phase, center point and modulation width for sine waves
          this.ColorFreq = 0.036;
          this.ColorPhase1 = 2; // phase..
          this.ColorPhase2 = 4; // shift..
          this.ColorPhase3 = 0; // ...with these
          this.ColorCenter = 128;
          this.ColorWidth = 127; // reducing this causes desaturation
          // Initialize Colors array and create counter for cycling
          this.Colors = [];
          for (Index = 0; Index < this.NumShapes; Index += 1) {
            this.Colors[Index] = "rgba(0,0,0,1.0)";
          }
          this.ColorCounter = 0;
          // Create Levels array to store a data discreet value for each shape instance
          this.Levels = [];
          // Call this.clearLevels() once to initialize this.Levels array
          this.clearLevels();
        },
        resize: function () {
          this.Canvas.width = window.innerWidth;
          this.Canvas.height = window.innerHeight;
          this.XCenter = this.Canvas.width / 2;
          this.YCenter = this.Canvas.height / 2;
        },
        /**
         * Main loop function to play animation
         */
        animationLoop: function () {
          this.animationLoopTimeOutId = setTimeout(() => {
            Visualiser.animationLoop()
            this.updateLevels();
            this.animateFrame();
          }, 1000 / this.FPS);
        },
        /**
         * Draw a single frame of the visualisation
         */
        animateFrame: function () {
          var Index, LineWidth1, LineWidth2, Size, Shade;
          if (this.ColorCycle == true) {
            // Update Colors array
            this.updateColours();
          }
          // Clear previous frame
          this.Context.fillRect(0, 0, this.Canvas.width, this.Canvas.height);
          // for loop for each shape instance (per frame)
          for (Index = 1; Index <= this.NumShapes; Index += 1) {
            // Map corresponding value from amplitude data array to path width for current shape instance,
            // if 'Hyper' is on the multiply by inverse of array position
            if (this.Hyper == true) {
              LineWidth1 = this.Levels[this.Levels.length - Index] * (this.NumShapes - Index);
            } else {
              LineWidth1 = this.Levels[this.Levels.length - Index];
            }
            // Multiply path width value by 0.25 for use in accompanying white 'highlight' instance
            LineWidth2 = LineWidth1 * 0.25;
            // Increase size value for each concentric shape instance (based on current perspective mode).
            if (this.Perspective == 0) {
              Size = this.StepInc * Index;
            } else {
              Size = Index * Index;
            }
            // Traverse Color array to reference appropriate color shade for currunt shape instance
            Shade = this.Colors[this.Colors.length - Index];
            // Draw current concentric shape instance(s)
            if (this.Shape1) {
              this.drawPolygon(LineWidth2, this.Sides1, Size, "rgba(256,256,256,0.6)");
              this.drawPolygon(LineWidth1, this.Sides1, Size, Shade);
            }
            if (this.Shape2) {
              this.drawPolygon(LineWidth2, this.Sides2, Size, "rgba(256,256,256,0.6)");
              this.drawPolygon(LineWidth1, this.Sides2, Size, Shade);
            }
          }
        },
        /**
         * Function to draw a single polygon shape instance
         */
        drawPolygon: function (Width, NumberOfSides, Size, Shade) {
          var Index;
          this.Context.beginPath();
          this.Context.moveTo(this.XCenter + Size * Math.cos(0), this.YCenter + Size * Math.sin(0));
          for (Index = 1; Index <= NumberOfSides; Index += 1) {
            this.Context.lineTo(
              this.XCenter + Size * Math.cos((Index * 2 * Math.PI) / NumberOfSides),
              this.YCenter + Size * Math.sin((Index * 2 * Math.PI) / NumberOfSides)
            );
          }
          this.Context.lineWidth = Width;
          this.Context.strokeStyle = Shade;
          this.Context.closePath();
          this.Context.stroke();
        },
        /**
         * Update Colours array.
         */
        updateColours: function () {
          // Get current colour value from cycle and add to end of array.
          this.Colors.push(
            this.getColor(
              this.ColorFreq,
              this.ColorPhase1,
              this.ColorPhase2,
              this.ColorPhase3,
              this.ColorCenter,
              this.ColorWidth
            )
          );
          // Trim the oldest value from the front of the array
          this.Colors.splice(0, 1);
        },
        /**
         * Clears Levels array (fills with 0.1 values to clear screen)
         */
        clearLevels: function () {
          var Index;
          for (Index = 0; Index < Visualiser.NumShapes; Index += 1) {
            this.Levels[Index] = 0.1;
          }
        },
        /**
         * Update Levels array.
         */
        updateLevels: function () {
          var Index, Volume;
          // Get current Time Domain value from Analyser node.
          this.Analyser.getByteTimeDomainData(this.Data);
          // Add amplitude value for current frame to the end of the array. -128 centers the 0db value around zero, (as opposed to 128 of 256).
          // Use Math.abs to negate a negative values, and *0.25 to scale resulting values appropriately (for line width drawing).
          this.Levels.push(Math.abs(this.Data[0] - 128) * 0.25);
          // Trim the oldest value from the front of the array
          this.Levels.splice(0, 1);
        },
        /**
         * Generates a single colour step in the colour cycle
         */
        getColor: function (frequency, phase1, phase2, phase3, center, width) {
          var r = Math.sin(frequency * this.ColorCounter + phase1) * width + center;
          var g = Math.sin(frequency * this.ColorCounter + phase2) * width + center;
          var b = Math.sin(frequency * this.ColorCounter + phase3) * width + center;
          this.ColorCounter++;
          return "rgba(" + Math.round(r) + "," + Math.round(g) + "," + Math.round(b) + ",0.5)";
        },
      };
</script>