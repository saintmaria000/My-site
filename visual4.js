let fireParticles = [];
let numFireParticles = 5000;
let fireHeight = 400;
let fireWidth = 200;

// === 初期化 ===
function initVisual4() {
  fireParticles = [];
  for (let i = 0; i < numFireParticles; i++) {
    let x = random(-fireWidth, fireWidth);
    let y = random(-fireHeight, 0);
    fireParticles.push({
      basePos: createVector(x, y),
      pos: createVector(x, y),
      speed: random(0.5, 2),
      noiseOffset: random(1000),
      hue: random(20, 40)
    });
  }
}

// === 描画 ===
function drawVisual4() {
  background(0, 0, 0, 50);  // 残像効果
  noStroke();
  colorMode(HSB, 360, 100, 100, 100);

  let level = amplitude.getLevel();
  let spectrum = fft.analyze();

  for (let p of fireParticles) {
    // --- 揺らめき：ノイズ＋音量
    let n = noise(p.noiseOffset, frameCount * 0.01);
    let sway = map(n, 0, 1, -20, 20) * level * 5;
    let waveIndex = floor(map(p.pos.y, -fireHeight, 0, 0, spectrum.length));
    let amp = map(spectrum[waveIndex], 0, 255, 0, 1);

    let x = p.basePos.x + sway + sin(frameCount * 0.02 + p.pos.y * 0.05) * 10 * amp;
    let y = p.pos.y + p.speed + amp * 5;

    fill(p.hue, 100, 100, map(p.pos.y, -fireHeight, 0, 0, 100));
    ellipse(x + width / 2, height - y, 2, 2);

    p.pos.y += p.speed + amp * 3;
    if (p.pos.y > 0) {
      p.pos.y = random(-fireHeight, -20);
      p.noiseOffset = random(1000);
      p.basePos.x = random(-fireWidth, fireWidth);
    }
  }
}
