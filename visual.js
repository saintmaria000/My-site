let colorSpread = 0;
let currentHue = 0;
let nextHue = 60;
let step = 2;
let maxOffset;

function drawColorFillSpread() {
  let baseY = height / 2;
  maxOffset = height / 2;
  let gradientHeight = 80;

  noStroke();

  for (let offset = 0; offset <= colorSpread && offset <= maxOffset; offset++) {
    let isGradientZone = offset > colorSpread - gradientHeight;
    let t = isGradientZone
      ? map(offset, colorSpread - gradientHeight, colorSpread, 0, 1)
      : 1;

    let hue = lerp(currentHue, nextHue, t);
    let fade = map(offset, 0, maxOffset, 1, 0);
    let alpha = isGradientZone
      ? 100 * fade * pow(t, 2)
      : 100 * fade;

    fill(hue % 360, 100, 80, alpha);

    // 🌊 Y位置を波形に変形
    let waveOffset = sin((offset + frameCount * 2) * 0.05) * 10; // 波の高さ＆速さ

    // 上下にうねる
    rect(0, baseY - offset + waveOffset, width, 1);
    rect(0, baseY + offset + waveOffset, width, 1);
  }

  colorSpread += step;

  if (colorSpread > maxOffset) {
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
