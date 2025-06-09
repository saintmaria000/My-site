let colorSpread = 0;
let currentHue = 0;
let nextHue = 60;
let step = 2;
let maxOffset;

function drawColorFillSpread() {
  let baseY = height / 2;
  maxOffset = height / 2;
  let gradientHeight = 60;

  noStroke();

  for (let offset = 0; offset <= colorSpread && offset <= maxOffset; offset++) {
    let isGradientZone = (offset > colorSpread - gradientHeight);
    let t = isGradientZone
      ? map(offset, colorSpread - gradientHeight, colorSpread, 0, 1)
      : 1;

    let hue = lerpHue(currentHue, nextHue, t);
    let alpha = map(offset, 0, maxOffset, 100, 0);

    fill(hue % 360, 100, 80, alpha);

    rect(0, baseY - offset, width, 1);
    rect(0, baseY + offset, width, 1);
    
  }

  colorSpread += step;

  if (colorSpread > maxOffset) {
    colorSpread = 0;
    currentHue = nextHue;
    nextHue = (nextHue + 60) % 360;
  }
}

// --- 色相を360度環で補間する関数 ---
function lerpHue(a, b, t) {
  let d = b - a;
  if (abs(d) > 180) {
    if (d > 0) a += 360;
    else       b += 360;
  }
  return (lerp(a, b, t) + 360) % 360;
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
