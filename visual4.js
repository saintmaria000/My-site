let fireParticles = [];
let numFireParticles = 5000;
let fireHeight = 400;

function initVisual4() {
  let fireHeight = height;
  fireWidth = width;
  fireParticles = [];

  for (let i = 0; i < numFireParticles; i++) {
    let x = random(-fireWidth / 2, fireWidth / 2);
    let y = random(-fireHeight, 0);
    let z = random(0.2, 1); // 奥行き

    fireParticles.push({
      basePos: createVector(x, y),
      pos: createVector(x, y),
      speed: random(0.5, 2),
      noiseOffset: random(1000),
      hue: random(20, 40),
      z: z,
      flashTimer: 0
    });
  }
}

function drawVisual4() {
  push();
  translate(width / 2, height);  // 中央下端起点
  noStroke();
  colorMode(HSB, 360, 100, 100, 100);

  // 背景の残像効果
  fill(0, 0, 0, 10);
  rect(-width / 2, -height, width, height * 2);

  let spectrum = fft.analyze();
  let level = amplitude.getLevel();

  for (let p of fireParticles) {
    // --- 1. ベースのゆらぎ（Perlin noise） ---
    let noiseVal = noise(p.noiseOffset, frameCount * 0.01);
    let noiseSway = map(noiseVal, 0, 1, -20, 20) * p.z;

    // --- 2. グループ的なsinうねり（xの位置で揺れがずれる）---
    let sinSway = sin(frameCount * 0.05 + p.basePos.x * 0.01) * 40 * level * p.z;

    // --- 3. スペクトラムから振幅を取得 ---
    let waveIndex = floor(map(p.pos.y, -fireHeight, 0, 0, spectrum.length));
    let amp = map(spectrum[waveIndex], 0, 255, 0, 1) * p.z;

    // --- 4. 座標計算（xは2種の揺らぎ、yは上昇） ---
    let x = p.basePos.x + noiseSway + sinSway;
    let y = p.pos.y - (p.speed + amp * 5);

    // --- 5. 色と透明度（立体感） ---
    let hue = map(p.pos.y, -fireHeight, 0, 20, 40);
    let alpha = map(p.pos.y, -fireHeight, 0, 100, 0) * p.z;
    let size = map(p.z, 0.2, 1, 1, 3);

    // --- 6. 音で白点滅する ---
    if (amp > 0.8 && random() < 0.2) {
      p.flashTimer = 3;
    }

    if (p.flashTimer > 0) {
      fill(0, 0, 100, alpha);  // 白
      p.flashTimer--;
    } else {
      fill(hue, 100, 100, alpha);  // 通常色
    }

    ellipse(x, y, size, size);

    // --- 7. y位置更新（上昇） ---
    p.pos.y -= (p.speed + amp * 3);

    // --- 8. 頂点超えたらリセット ---
    if (p.pos.y < -fireHeight) {
      p.pos.y = 0;
      p.noiseOffset = random(1000);
      p.basePos.x = random(-fireWidth / 2, fireWidth / 2);
    }
  }

  pop();
}
