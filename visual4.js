let particles = [];
let maxParticles = 10000;
let emissionRate = 100;
let flowFieldScale = 0.01;
let pulseThreshold = 0.7;
let clusterRadius = 30;
let clusterThreshold = 30;

function initVisual4() {
  particles = [];
}

function drawVisual4() {
  noStroke();
  fill(0, 10);
  rect(0, 0, width, height);
  colorMode(HSB, 360, 100, 100, 100);

  // パーティクル生成（初期のみ）
  if (particles.length < maxParticles) {
    for (let i = 0; i < emissionRate; i++) {
      let edge = random(["left", "right", "bottom"]);
      let x = (edge === "left") ? 0 : (edge === "right") ? width : random(width);
      let y = (edge === "bottom") ? height : random(height / 2, height);
      particles.push({
        pos: createVector(x, y),
        prev: createVector(x, y),
        alpha: 0,
        angleOffset: random(1000),
        biasAngle: null
      });
    }
  }

  let level = getBass(); // audio.js連携

  for (let p of particles) {
    p.prev.set(p.pos);

    // 通常のフロウ方向
    let baseAngle = noise(p.pos.x * flowFieldScale, p.pos.y * flowFieldScale, frameCount * 0.005) * TWO_PI * 2;
    let moveAngle = baseAngle;

    // クラスタチェック
    let neighbors = 0;
    let sumAngle = 0;
    for (let other of particles) {
      if (other === p) continue;
      let d = p5.Vector.dist(p.pos, other.pos);
      if (d < clusterRadius) {
        neighbors++;
        let a = noise(other.pos.x * flowFieldScale, other.pos.y * flowFieldScale, frameCount * 0.005) * TWO_PI * 2;
        sumAngle += a;
      }
    }

    if (neighbors >= clusterThreshold) {
      let avgAngle = sumAngle / neighbors;
      // 分散ベクトル = 通常と逆向き + 微調整
      moveAngle = avgAngle + PI + sin(frameCount * 0.01 + p.angleOffset) * 0.5;
    }

    let v = p5.Vector.fromAngle(moveAngle).mult(1.2);
    p.pos.add(v);

    // ワープ処理（前位置保存後）
    let wrapped = false;
    if (p.pos.x < 0) { p.pos.x = width; wrapped = true; }
    if (p.pos.x > width) { p.pos.x = 0; wrapped = true; }
    if (p.pos.y < 0) { p.pos.y = height; wrapped = true; }
    if (p.pos.y > height) { p.pos.y = 0; wrapped = true; }

    // フェードイン
    if (p.alpha < 100) p.alpha += 2;

    // 色（赤系）
    let hue = 10 + noise(p.pos.x * 0.01, p.pos.y * 0.01) * 20;
    let alpha = p.alpha;

    // 点滅（低音）
    if (level > pulseThreshold) {
      stroke(0, 0, 100, alpha); // 白発光
    } else {
      stroke(hue, 100, 100, alpha);
    }

    if (!wrapped) {
      line(p.prev.x, p.prev.y, p.pos.x, p.pos.y);
    }
  }
}
