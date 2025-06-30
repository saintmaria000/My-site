let particles = [];
const maxParticles = 10000;
const baseEmissionRate = 50;

// === ノイズと流れ調整 ===
const flowFieldScale = 0.005;     // 🔧 ノイズの滑らかさ
const noiseStrength = 1.2;        // 🔧 ノイズの勢い
const upwardInfluence = 0.1;      // 🔧 上昇方向ベクトルの影響度

const reflowChance = 0.2;         // ワープ時のランダム再配置確率

function initVisual4() {
  particles = [];
}

function drawVisual4() {
  noStroke();
  fill(0, 10);
  rect(0, 0, width, height);
  colorMode(HSB, 360, 100, 100, 100);

  // === パーティクル生成 ===
  while (particles.length < maxParticles) {
    addParticle();
  }

  const kick = isKick();

  for (let i = particles.length - 1; i >= 0; i--) {
    const p = particles[i];

    // ノイズ＋上昇ベクトルのブレンド
    const angle = noise(p.pos.x * flowFieldScale, p.pos.y * flowFieldScale, frameCount * 0.005) * TWO_PI;
    const noiseVec = p5.Vector.fromAngle(angle).mult(noiseStrength);
    const upVec = createVector(0, -1);
    const flow = p5.Vector.lerp(noiseVec, upVec, upwardInfluence);
    p.pos.add(flow);

    // === 左右に出たら反対側へワープ ===
    if (p.pos.x < 0) p.pos.x = width;
    if (p.pos.x > width) p.pos.x = 0;

    // === 上に出たら下からワープ ===
    if (p.pos.y < 0) {
      p.pos.y = height;
      if (random() < reflowChance) p.pos.x = random(width);
    }

    // === 下に出たら削除 → 再生成 ===
    if (p.pos.y > height) {
      particles.splice(i, 1);
      addParticle();
      continue;
    }

    // === フェードイン ===
    if (p.alpha < 100) p.alpha += 2;

    // === 色とキックによる点滅 ===
    const hue = 10 + noise(p.pos.x * 0.01, p.pos.y * 0.01) * 20;
    const alpha = p.alpha;
    fill(kick ? color(0, 0, 100, alpha) : color(hue, 100, 100, alpha));
    ellipse(p.pos.x, p.pos.y, 2, 2);
  }
}

// === 下端からランダムに生成 ===
function addParticle() {
  const x = random(width);
  const y = height;
  particles.push({ pos: createVector(x, y), alpha: 0 });
}
