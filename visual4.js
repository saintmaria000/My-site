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
    let z = 1; // ブレ排除のため固定奥行き

    fireParticles.push({
      basePos: createVector(x, y),
      hue: 30, // 一律の基本色（赤系）
      z: z,
      flashTimer: 0
    });
  }
}

function drawVisual4() {
  push();
  translate(width / 2, height);  // 下中央から描画
  noStroke();
  colorMode(HSB, 360, 100, 100, 100);

  // 残像フェード背景
  fill(0, 0, 0, 10);
  rect(-width / 2, -height, width, height * 2);

  let spectrum = fft.analyze();
  let level = amplitude.getLevel();
  let t = frameCount * 0.03;  // 時間ベース

  for (let p of fireParticles) {
    // Yのベース位置 → 高さにマッピング
    let baseY = map(p.basePos.y, -fireHeight, 0, -height, 0);

    // Y方向 sin波で一様な上下揺れ
    let waveY = sin(p.basePos.x * 0.01 + t) * 40 * level;
    let y = baseY + waveY;

    // X方向は一切揺らさない → ブレ排除
    let x = p.basePos.x;

    // 音量スペクトラムに基づく振幅
    let waveIndex = floor(map(p.basePos.y, -fireHeight, 0, 0, spectrum.length));
    let amp = map(spectrum[waveIndex], 0, 255, 0, 1);

    // 70%で白く点滅（ブレなし）
    if (amp > 0.4) {
      p.flashTimer = 2;
    }

    // 色とサイズ
    let hue = 30; // 一律赤〜橙系
    let alpha = map(y, -height, 0, 100, 0);
    let size = 2;

    // 進行波による青変化
    let threshold = 6;
    let distanceToWave = abs(waveY);

    if (p.flashTimer > 0) {
      fill(0, 0, 100, alpha);  // 白
      p.flashTimer--;
    } else if (distanceToWave < threshold) {
      fill(180, 100, 100, alpha);  // 青（波通過時）
    } else {
      fill(hue, 100, 100, alpha);  // 通常色（赤系）
    }

    ellipse(x, y, size, size);
  }

  pop();
}
