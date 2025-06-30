let particles = [];
const maxParticles = 10000;
const baseEmissionRate = 50;

// === ノイズと流れ調整 ===
const flowFieldScale = 0.008;     // 🔧 ノイズの滑らかさ
const noiseStrength = 1.5;        // 🔧 ノイズの勢い
const upwardInfluence = 0.5;      // 🔧 上昇方向ベクトルの影響度（0〜1）
const reflowChance = 0.4;         // ワープ時のランダム再配置確率

function initVisual4() {
  particles = [];
}

function drawVisual4() {
  noStroke();
  fill(0, 8);  // 🔧 軌跡を残す残像量（高いとすぐ消える）
  rect(0, 0, width, height);
  colorMode(HSB, 360, 100, 100, 100);

  // === パーティクル生成 ===
  while (particles.length < maxParticles) {
    addParticle();
  }

  const kick = isKick();  // audio.js 側のキック判定

  for (let i = particles.length - 1; i >= 0; i--) {
    const p = particles[i];

    // --- ノイズ＋上昇ベクトルのブレンドによる加速 ---
    const angle = noise(p.pos.x * flowFieldScale, p.pos.y * flowFieldScale, frameCount * 0.005) * TWO_PI;
    const noiseVec = p5.Vector.fromAngle(angle).mult(noiseStrength);
    const upVec = createVector(0, -1);
    const flow = p5.Vector.lerp(noiseVec, upVec, upwardInfluence);
    p.vel.add(flow.limit(2)); // 🔧 ノイズによる加速を制限
    p.pos.add(p.vel);

    // === 左右ワープ ===
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

    // === フェードイン処理 ===
    if (p.alpha < 100) p.alpha += 2;

    // === 色と点滅（キック時白） ===
    const hue = 10 + noise(p.pos.x * 0.01, p.pos.y * 0.01) * 20;
    const alpha = p.alpha;
    fill(kick ? color(0, 0, 100, alpha) : color(hue, 100, 100, alpha));
    ellipse(p.pos.x, p.pos.y, 2, 2);
  }
}

// === パーティクル生成（下端から、初期速度ランダム） ===
function addParticle() {
  const x = random(width);
  const y = height + random(0, 20); // 🔧 少しだけ画面外からも生成
  const initialVel = createVector(random(-0.5, 0.5), random(-2, -0.5)); // 🔧 初速でふわっと舞う
  particles.push({ pos: createVector(x, y), vel: initialVel, alpha: 0 });
}
