let particles = [];
const maxParticles = 10000;
const baseEmissionRate = 50;

// === ノイズと流れ調整 ===
const flowFieldScale = 0.005;     // 🔧 ノイズの滑らかさ（小さいと滑らか、大きいと激しい）
const noiseStrength = 1.2;        // 🔧 ノイズベクトルの強さ（揺れの勢い）
const upwardInfluence = 0.1;      // 🔧 上昇ベクトルの影響度（0〜1：0.1は「ほぼノイズ、少し上」）

const reflowChance = 0.2;         // ワープ時にランダム配置される確率

function initVisual4() {
  particles = [];
}

function drawVisual4() {
  noStroke();
  fill(0, 10);  // 背景フェードで軌跡を残す
  rect(0, 0, width, height);
  colorMode(HSB, 360, 100, 100, 100);

  // === パーティクル生成 ===
  let emissionRate = baseEmissionRate;
  while (particles.length < maxParticles && emissionRate-- > 0) {
    const edge = random(["left", "right", "bottom"]);
    const x = (edge === "left") ? 0 :
              (edge === "right") ? width : random(width);
    const y = (edge === "bottom") ? height : height / 2 + random(height / 2);
    particles.push({ pos: createVector(x, y), alpha: 0 });
  }

  const kick = isKick(); // audio.js 側の高精度キック検出（true/false）

  for (const p of particles) {
    // ノイズベクトル
    const angle = noise(p.pos.x * flowFieldScale, p.pos.y * flowFieldScale, frameCount * 0.005) * TWO_PI;
    const noiseVec = p5.Vector.fromAngle(angle).mult(noiseStrength);

    // 上方向ベクトル（0, -1）とのブレンド
    const upVec = createVector(0, -1);
    const flow = p5.Vector.lerp(noiseVec, upVec, upwardInfluence);  // 🔧 上昇の強さは upwardInfluence を調整

    // 移動
    p.pos.add(flow);

    // === 画面端ワープ処理 ===
    if (p.pos.x < 0 || p.pos.x > width) {
      p.pos.x = (p.pos.x < 0) ? width : 0;
      if (random() < reflowChance) p.pos.y = random(height);
      continue;
    }
    if (p.pos.y < 0 || p.pos.y > height) {
      p.pos.y = (p.pos.y < 0) ? height : 0;
      if (random() < reflowChance) p.pos.x = random(width);
      continue;
    }

    // === フェードイン ===
    if (p.alpha < 100) p.alpha += 2;

    // === 点滅（キック時は白、それ以外は赤系ノイズ色） ===
    const hue = 10 + noise(p.pos.x * 0.01, p.pos.y * 0.01) * 20;
    const alpha = p.alpha;
    fill(kick ? color(0, 0, 100, alpha) : color(hue, 100, 100, alpha));
    ellipse(p.pos.x, p.pos.y, 2, 2);
  }
}
