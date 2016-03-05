module.exports = function(cnvs) {
  var frameData;
  var frameCurrent;
  var frameTotal;
  var docCtx;
  var docCnvs;
  var parser = require("./lib/grammar.js").parse;
  var dtc = require("./lib/dataToCanvas.js");
  var anim;
  var runAnimation = false;

  /* REGION Animation related */
  var animInt = 1000 / 30;
  var cuInt = 0;
  var cuTime;
  var oldTime = Date.now();
  var dTime = 0;
  /* ENDREGION Animation related */

  // Initialize canvas
  docCnvs = cnvs;
  resetCanvas(docCnvs);

  this.setAnimationInterval = function setAnimationInterval(i) {
    animInt = i;
  }
  this.setAnimationFPS = function setAnimationFPS(i) {
    animInt = 1000 / i;
  }
  this.getCurrentInterval = function getCurrentInterval() {
    return cuInt;
  }
  this.getCurrentFPS = function getCurrentFPS() {
    return 1000 / cuInt;
  }

  function initialize(data) {
    // Seperate each frame into an array
    var frames = data.split("newframe");
    frameCurrent = 0;
    frameTotal = frames.length;

    // Initialize the data arrays
    var frameLines = new Array(frames.length);
    frameData = new Array(frames.length);
    // Split the data line by line and parse it
    for (var i = 0; i < frames.length; i++) {
      frameLines[i] = frames[i].replace("\r", "").split("\n").filter(function(arg) {return arg.length > 0;});
      frameData[i] = new Array(frameLines[i].length);
      for (var b = 0; b < frameLines[i].length; b++) {
        frameData[i][b] = parser(frameLines[i][b]);
      }
    }
  }
  function resetCanvas(cnvs) {
    docCtx = cnvs.getContext("2d");
    docCtx.fillStyle = "#000000";
    docCtx.clearRect(0, 0, docCnvs.width, docCnvs.height);
  }
  function draw() {
    cuTime = Date.now();
    dTime = cuTime - oldTime;

    if (dTime > animInt) {
      cuInt = dTime;

      // clear frame
      docCtx.clearRect(0, 0, docCnvs.width, docCnvs.height);

      // draw frame
      for (var i = 0; i < frameData[frameCurrent].length; i++) {
        dtc(docCtx, frameData[frameCurrent][i]);
      }

      // Increase frame
      if (frameCurrent + 1 >= frameTotal)
        frameCurrent = 0;
      else
        frameCurrent++;

      /*
        This will subtract the amount of time it takes to draw the frame, in
        order for the program to have a fairly accurate FPS.
      */
      oldTime = cuTime - (dTime % animInt);
    }

    if (frameTotal > 1 && runAnimation)
      anim = requestAnimationFrame(draw);
  }
  this.draw = function draw(data) {
    /*
     As per your request: draw can now be called using it's distinctive function.
     It is no longer necessary to call startAnimation for a simple draw action,
     however, startAnimation, despite it's name will not launch an animation so
     long there is not more than one frame in the frame buffer.
    */
    this.startAnimation(data);
  }
  this.startAnimation = function startAnimation(data) {
    /*
      If a current animation is running, this will stop the current animation,
      wait 50ms and then start the newly provided animation.
      Note: If the provided frame data does only contain one frame, no
      animation will be launched.
    */
    if (runAnimation == true) {
      this.stopAnimation();
      setTimeout(this.startAnimation(data), 50);
    } else {
      initialize(data);
      runAnimation = true;
      anim = requestAnimationFrame(draw);
    }
  }
  this.stopAnimation = function stopAnimation() {
    /*
      Stops the current animation.
    */
    runAnimation = false;
    cancelAnimationFrame(anim);
    anim = undefined;
  }
}
