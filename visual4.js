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
    let y = random(-fireHeight, 0);
    let z = random(0.2, 1);

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
  translate(width / 2, height);
  noStroke();
  colorMode(HSB, 360, 100, 100, 100);

  // 背景の残像
  fill(0, 0, 0, 10);
  rect(-width / 2, -height, width, height * 2);

  let spectrum = fft.analyze();
  let level = amplitude.getLevel();
  let t = frameCount * 0.03;

  for (let p of fireParticles) {
    // 固定されたYベース
    let baseY = map(p.basePos.y, -fireHeight, 0, -height, 0);

    // sin波による進行波変位
    let waveY = sin(p.basePos.x * 0.01 + t) * 40 * level * p.z;
    let y = baseY + waveY;

    // 横の揺らぎ
    let noiseVal = noise(p.noiseOffset, frameCount * 0.01);
    let noiseSway = map(noiseVal, 0, 1, -20, 20) * p.z;
    let sinSway = sin(p.basePos.y * 0.01 + t * 0.8) * 20 * level * p.z;
    let x = p.basePos.x + noiseSway + sinSway;

    // 音に対する反応
    let waveIndex = floor(map(p.basePos.y, -fireHeight, 0, 0, spectrum.length));
    let amp = map(spectrum[waveIndex], 0, 255, 0, 1) * p.z;

    // ✅ 70%の確率ですべてのパーティクルに点滅判定を付与
    if (amp > 0.4 && random() < 0.7) {
      p.flashTimer = 2;
    }

    // 色設定
    let hue = map(y, -height, 0, 20, 40);
    let alpha = map(y, -height, 0, 100, 0) * p.z;
    let size = map(p.z, 0.2, 1, 1, 3);

    // 波の通過検知（青くする）
    let threshold = 6;
    let distanceToWave = abs(waveY);

    if (p.flashTimer > 0) {
      fill(0, 0, 100, alpha);  // 白点滅
      p.flashTimer--;
    } else if (distanceToWave < threshold) {
      fill(180, 100, 100, alpha);  // 波が通過中 → 青
    } else {
      fill(hue, 100, 100, alpha);  // 通常（赤〜黄）
    }

    ellipse(x, y, size, size);
  }

  pop();
}
