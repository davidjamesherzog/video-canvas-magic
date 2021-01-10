document.addEventListener('DOMContentLoaded', () => {
  const video = document.getElementById('video-player');
  const canvas = document.getElementById('canvas-player');
  const context = canvas.getContext('2d');
  const back = document.createElement('canvas');
  const backcontext = back.getContext('2d');
  
  video.addEventListener('play', function() {
    const cw = Math.floor(canvas.clientWidth / 100);
    const ch = Math.floor(canvas.clientHeight / 100);
    canvas.width = cw;
    canvas.height = ch;
    drawBackground(this, context, cw, ch);
  }, false);

  video.addEventListener('play', function() {
    const cw = video.clientWidth;
    const ch = video.clientHeight;
    back.width = cw;
    back.height = ch;
    draw(this, getCanvas('canvas-black-white', cw, ch), backcontext, cw, ch, drawBlackWhite);
    draw(this, getCanvas('canvas-embossed', cw, ch), backcontext, cw, ch, drawEmbossed);
    draw(this, getCanvas('canvas-red', cw, ch), backcontext, cw, ch, drawRed);
    draw(this, getCanvas('canvas-green', cw, ch), backcontext, cw, ch, drawGreen);
    draw(this, getCanvas('canvas-blue', cw, ch), backcontext, cw, ch, drawBlue);
    draw(this, getCanvas('canvas-inverted', cw, ch), backcontext, cw, ch, drawInverted);
  }, false);

}, false);

function getCanvas(id, cw, ch) {
  const canvas = document.getElementById(id);
  canvas.width = cw;
  canvas.height = ch;
  return canvas.getContext('2d');
}

function drawBackground(video, canvas, width, height) {
  if (video.paused || video.ended) return false;
  canvas.drawImage(video, 0, 0, width, height);
  setTimeout(drawBackground, 20, video, canvas, width, height);
}

function draw(video, canvas, backContext, width, height, callback) {
  if (video.paused || video.ended) return false;
  // First, draw it into the backing canvas
  backContext.drawImage(video, 0, 0, width, height);
  // Grab the pixel data from the backing canvas
  const idata = backContext.getImageData(0, 0, width, height);
  const data = idata.data;
  callback(idata, data);
  // Draw the pixels onto the visible canvas
  canvas.putImageData(idata,0,0);
  // Start over!
  setTimeout(draw, 20, video, canvas,backContext, width, height, callback);
}

function drawBlackWhite(data, data) {
  for (let i = 0; i < data.length; i += 4) {
      // turn to grayscale    
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];
      const brightness = (3 * r + 4 * g + b)>>>3;
      data[i] = brightness;
      data[i + 1] = brightness;
      data[i + 2] = brightness;
  }
}

function drawRed(data, data) {
  for (let i = 0; i < data.length; i += 4) {
      // keep red
      data[i+1] = 0; // clear green
      data[i+2] = 0; // clear blue
  }
}

function drawGreen(data, data) {
  for (let i = 0; i < data.length; i += 4) {
      // keep green
      data[i] = 0; // clear red
      data[i+2] = 0; // clear blue
  }
}

function drawBlue(data, data) {
  for (let i = 0; i < data.length; i += 4) {
      // keep blue
      data[i] = 0; // clear red
      data[i+1] = 0; // clear green
  }
}

function drawEmbossed(idata, data) {
  const w = idata.width;
  const limit = data.length
  // Loop through the subpixels, convoluting each using an edge-detection matrix.
  for (let i = 0; i < limit; i++) {
      if ( i % 4 == 3 ) continue;
      data[i] = 127 + 2 * data[i] - data[i + 4] - data[i + w * 4];
  }
}

function drawInverted(data, data) {
  for (let i = 0; i < data.length; i += 4) {
      // invert
      data[i] = data[i] ^ 255; // Invert Red
      data[i+1] = data[i+1] ^ 255; // Invert Green
      data[i+2] = data[i+2] ^ 255; // Invert Blue
  }
}
