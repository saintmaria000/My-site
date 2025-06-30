let particles = [];
const maxParticles = 10000;
const baseEmissionRate = 50;
const flowFieldScale = 0.01;
const reflowChance = 0.2;    // ワープ時のランダム再配置率

function initVisual4() {
  particles = [];
}

function drawVisual4() {
  noStroke();
  fill(0, 10);  // 背景フェード
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

  const kick = isKick(); // audio.js 側の関数：true/false

  for (const p of particles) {
    // ノイズベースの移動方向
    const angle = noise(p.pos.x * flowFieldScale, p.pos.y * flowFieldScale, frameCount * 0.005) * TWO_PI * 2;
    const v = p5.Vector.fromAngle(angle).mult(1.2);
    p.pos.add(v);

    // 画面端ワープ
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

    // フェードイン
    if (p.alpha < 100) p.alpha += 2;

    // 色と点滅処理（キック時に白）
    const hue = 10 + noise(p.pos.x * 0.01, p.pos.y * 0.01) * 20;
    const alpha = p.alpha;
    fill(kick ? color(0, 0, 100, alpha) : color(hue, 100, 100, alpha));
    ellipse(p.pos.x, p.pos.y, 2, 2);
  }
}
