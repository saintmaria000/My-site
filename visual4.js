let waveParticles = [];
let numWaveParticles = 300;
let fireWidth;

function initVisual4() {
  fireWidth = width;
  waveParticles = [];

  let spacing = fireWidth / numWaveParticles;

  for (let i = 0; i < numWaveParticles; i++) {
    let x = -fireWidth / 2 + i * spacing;
    waveParticles.push({
      x: x,
      z: random(0.2, 1),       // 奥行き
      flashTimer: 0            // 白点滅用
    });
  }
}

function drawVisual4() {
  push();
  translate(width / 2, height / 2);  // 中心基準
  noStroke();
  colorMode(HSB, 360, 100, 100, 100);

  // 背景残像（炎らしい連続性）
  fill(0, 0, 0, 10);
  rect(-width / 2, -height / 2, width, height);

  let t = frameCount * 0.05;

  for (let p of waveParticles) {
    // --- sin波の合成 ---
    let y1 = sin(p.x * 0.02 + t) * 100;
    let y2 = sin(p.x * 0.04 + t * 1.5) * 30;
    let y = y1 + y2;

    // --- 発色・透明度・サイズ ---
    let hue = map(y, -130, 130, 20, 40);
    let alpha = map(y, -130, 130, 100, 10);
    let size = map(p.z, 0.2, 1, 2, 4);

    // --- 白点滅ランダム（試験用）---
    if (random() < 0.01) {
      p.flashTimer = 3;
    }

    if (p.flashTimer > 0) {
      fill(0, 0, 100, alpha);
      p.flashTimer--;
    } else {
      fill(hue, 100, 100, alpha);
    }

    ellipse(p.x, y, size, size);
  }

  pop();
}
