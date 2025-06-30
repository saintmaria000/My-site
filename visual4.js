let fireParticles = [];
let numFireParticles = 5000;
let fireHeight;
let fireWidth;

function initVisual4() {
  fireHeight = height;
  fireWidth = width;
  fireParticles = [];

  for (let i = 0; i < numFireParticles; i++) {
    let x = random(-fireWidth / 2, fireWidth / 2);
    let y = random(-fireHeight, 0); // パーティクル帯の基準Y
    let z = random(0.2, 1); // 奥行き（立体感）

    fireParticles.push({
      basePos: createVector(x, y),
      noiseOffset: random(1000),
      hue: random(20, 40),
      z: z,
      flashTimer: 0
    });
  }
}

function drawVisual4() {
  push();
  translate(width / 2, height);  // 描画の基点を画面下中央へ
  noStroke();
  colorMode(HSB, 360, 100, 100, 100);

  // 背景残像効果（黒の透明矩形でフェード）
  fill(0, 0, 0, 10);
  rect(-width / 2, -height, width, height * 2);

  let spectrum = fft.analyze();
  let level = amplitude.getLevel();

  for (let p of fireParticles) {
    // 高さに応じて固定されたY位置（画面上の帯）
    let baseY = map(p.basePos.y, -fireHeight, 0, -height, 0);
    let yWave = sin(frameCount * 0.04 + p.basePos.x * 0.01) * 30 * level * p.z;
    let y = baseY + yWave;

    // X方向の揺らぎ（自然さと連続性の鍵）
    let noiseVal = noise(p.noiseOffset, frameCount * 0.01);
    let noiseSway = map(noiseVal, 0, 1, -20, 20) * p.z;
    let sinSway = sin(frameCount * 0.05 + p.basePos.x * 0.01) * 40 * level * p.z;
    let x = p.basePos.x + noiseSway + sinSway;

    // 音の振幅に反応（スペクトルから取得）
    let waveIndex = floor(map(p.basePos.y, -fireHeight, 0, 0, spectrum.length));
    let amp = map(spectrum[waveIndex], 0, 255, 0, 1) * p.z;

    // 視覚パラメータ（色・透明度・サイズ）
    let hue = map(y, -height, 0, 20, 40);
    let alpha = map(y, -height, 0, 100, 0) * p.z;
    let size = map(p.z, 0.2, 1, 1, 3);

    // 白点滅のエフェクト（音が強い時）
    if (amp > 0.8 && random() < 0.2) {
      p.flashTimer = 3;
    }

    if (p.flashTimer > 0) {
      fill(0, 0, 100, alpha);  // 白発光
      p.flashTimer--;
    } else {
      fill(hue, 100, 100, alpha);  // 通常色（赤〜黄系）
    }

    ellipse(x, y, size, size);
  }

  pop();
}
