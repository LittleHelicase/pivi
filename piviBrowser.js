/*
  (c) 2015 Aron Lennart Starnitzke
  based on PiVi by LittleHelicase

  *** THIS IS A PROOF-OF-CONCEPT DESIGN. NO PRODUCTION USE! ***
*/
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

  // Initialize canvas
  docCnvs = cnvs;
  resetCanvas(docCnvs);

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

    if (frameTotal > 1 && runAnimation)
      anim = requestAnimationFrame(draw);
  }
  this.startAnimation = function startAnimation(data) {
    if (runAnimation == true) {
      this.stopAnimation();
      setTimeout(this.startAnimation(), 150);
    } else {
      initialize(data);
      runAnimation = true;
      anim = requestAnimationFrame(draw);
    }
  }
  this.stopAnimation = function stopAnimation() {
    runAnimation = false;
    cancelAnimationFrame(anim);
    anim = undefined;
  }
}
