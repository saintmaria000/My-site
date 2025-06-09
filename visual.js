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

    t = constrain(t, 0, 1);
    t = pow(t, 2.5); // ← 滑らかなイージンググラデーション

    let hue = lerpHue(currentHue, nextHue, t);
    let g = map(offset, 0, maxOffset, 0, 1);
    g = pow(t, 2.0); // 徐々に消える
    let alpha = lerp(100, 0, g);

    fill(hue % 360, 100, 80, alpha);
    rect(0, baseY - offset, width, 1);
    rect(0, baseY + offset, width, 1);
  }

  colorSpread += step;

  if (colorSpread > maxOffset + 1) {
    colorSpread = 0;
    currentHue = nextHue;
    nextHue = (nextHue + 60) % 360;
  }
}

// --- 色相環の補間 ---
function lerpHue(a, b, t) {
  let d = b - a;
  if (abs(d) > 180) {
    if (d > 0) a += 360;
    else b += 360;
  }
  return (lerp(a, b, t) + 360) % 360;
}

// --- 波形描画 ---
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

// --- 波形エリアだけを消す ---
function clearWaveformArea() {
  fill(0, 0, 0, 80);
  noStroke();
  rect(0, height * 0.25, width, height * 0.5); // ← 波形エリアだけ上書き
}
