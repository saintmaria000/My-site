// --- グローバル変数 ---
let colorSpread = 0;
let prevHue = 0;
let currentHue = 60;
let nextHue = 120;
let step = 2;
let maxOffset;

function drawColorFillSpread() {
  let baseY = height / 2;
  maxOffset = height / 2;
  let gradientHeight = 80; // グラデーションの範囲（大きくすると滑らか）

  noStroke();

  for (let offset = 0; offset <= colorSpread && offset <= maxOffset; offset++) {
    // グラデーションゾーン判定
    let isGradientZone = offset > colorSpread - gradientHeight;

    // 補間係数 t（0〜1）
    let t = isGradientZone
      ? map(offset, colorSpread - gradientHeight, colorSpread, 0, 1)
      : 1;

    // イージングをかけて滑らかに
    t = constrain(t, 0, 1);
    t = pow(t, 2.2);

    // 色相を過去の色 → 現在の色で補間
    let hue = lerpHue(prevHue, currentHue, t);

    // 徐々に透明になる alpha
    let alpha = 100;//map(offset, 0, maxOffset, 100, 0);

    fill(hue % 360, 100, 80, alpha);
    rect(0, baseY - offset, width, 1);
    rect(0, baseY + offset, width, 1);
  }

  // 拡がり更新
  colorSpread += step;

  // 拡がりが画面を覆ったら次の色へ
  if (colorSpread > maxOffset + 1) {
    colorSpread = 0;
    prevHue = currentHue;
    currentHue = nextHue;
    nextHue = (nextHue + 60) % 360;
  }
}

// --- 色相環の補間（360度対応） ---
function lerpHue(a, b, t) {
  let d = b - a;
  if (abs(d) > 180) {
    if (d > 0) a += 360;
    else       b += 360;
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
