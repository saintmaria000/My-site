// --- 可変パラメータ ---
let numParticles = 150;
let connectionThreshold = 80;

// --- パーティクル配列と状態管理 ---
let otonoamiParticles = [];
let exploded = false;
let lastKickTime = 0;
const kickInterval = 1000; // ms

// --- 初期化 ---
function initOtonoamiParticles() {
  otonoamiParticles = [];
  for (let i = 0; i < numParticles; i++) {
    let phi = Math.acos(1 - 2 * (i + 0.5) / numParticles);
    let theta = Math.PI * (1 + Math.sqrt(5)) * i;
    let r = 200;
    let x = r * Math.sin(phi) * Math.cos(theta);
    let y = r * Math.sin(phi) * Math.sin(theta);
    let z = r * Math.cos(phi);
    let pos = createVector(x, y, z);
    otonoamiParticles.push(new Particle(pos));
  }
  exploded = false;
}

// --- パーティクルクラス ---
class Particle {
  constructor(pos) {
    this.basePos = pos.copy();
    this.pos = pos.copy();
    this.vel = createVector();
    this.acc = createVector();
  }

  applyForce(force) {
    this.acc.add(force);
  }

  update() {
    this.vel.add(this.acc);
    this.pos.add(this.vel);
    this.acc.mult(0);
    this.vel.mult(0.94); // 摩擦
  }

  display() {
    push();
    translate(this.pos.x, this.pos.y, this.pos.z);
    noStroke();
    fill(200, 150, 255, 160);
    sphere(3);
    pop();
  }
}

// --- 爆発処理 ---
function triggerExplosion() {
  for (let p of otonoamiParticles) {
    let force = p5.Vector.random3D().mult(random(3, 6));
    p.applyForce(force);
  }
  exploded = true;
  lastKickTime = millis();
}

// --- メイン描画関数 ---
function drawOtonoamiExplodingVisual() {
  let bass = getBass();
  let now = millis();

  // 🎯 キックに反応して爆発
  if (bass > 180 && now - lastKickTime > kickInterval) {
    triggerExplosion();
  }

  // 🔧 パーティクルの更新と描画
  for (let p of otonoamiParticles) {
    p.update();
    p.display();
  }

  // 🔗 線の描画（近いペアを視覚的に接続）
  stroke(160, 80);
  for (let i = 0; i < otonoamiParticles.length; i++) {
    for (let j = i + 1; j < otonoamiParticles.length; j++) {
      let a = otonoamiParticles[i];
      let b = otonoamiParticles[j];
      let d = p5.Vector.dist(a.pos, b.pos);
      if (d < connectionThreshold) {
        line(a.pos.x, a.pos.y, a.pos.z, b.pos.x, b.pos.y, b.pos.z);
      }
    }
  }
}
