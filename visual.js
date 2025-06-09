let colorSpread = 0;
let currentHue = 0;
let nextHue = 60;

function drawColorFillSpread() {
  let baseY = height / 2;
  let step = 4;
  let maxOffset = height / 2;

  fill(currentHue, 100, 80, 100);
  noStroke();
  for (let offset = 0; offset <= colorSpread; offset++) {
    rect(0, baseY - offset, width, 1);
    rect(0, baseY + offset, width, 1);
  }

  colorSpread += step;
  if (colorSpread >= maxOffset) {
    colorSpread = 0;
    currentHue = nextHue;
    nextHue = (nextHue + 60) % 360;
  }
}

function drawWaveform() {
  let waveform = fft.waveform();
  stroke(255);
  noFill();
  beginShape();
  for (let i = 0; i < waveform.length; i++) {
    let x = map(i, 0, waveform.length, 0, width);
    let y = map(waveform[i], -1, 1, height * 0.25, height * 0.75);
    curveVertex(x, y);
  }
  endShape();
}

function clearWaveformArea() {
  fill(0, 0, 0, 80);
  noStroke();
  rect(0, 0, width, height);
}