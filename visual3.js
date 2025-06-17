// --- 可変パラメータ ---
let numParticles = 250;
let connectionThreshold = 80;
let returnThreshold = 0.15; // 音量がこれ以下なら戻る

// --- 状態管理 ---
let otonoamiParticles = [];
let exploded = false;
let lastKickTime = 0;
let kickCooldown = 300;
let connectionMap = new Set();

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
    let particle = new Particle(pos, i);
    otonoamiParticles.push(particle);
  }
  exploded = false;
  connectionMap.clear();
}

// --- パーティクルクラス ---
class Particle {
  constructor(pos, id) {
    this.id = id;
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
    this.vel.mult(0.92); // 摩擦
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

// --- 線の記憶・照合 ---
function registerConnection(a, b) {
  let key = [a.id, b.id].sort().join("-");
  connectionMap.add(key);
}

function shouldConnect(a, b) {
  let key = [a.id, b.id].sort().join("-");
  return connectionMap.has(key);
}

// --- 爆発処理 ---
function triggerExplosion(strength = 1) {
  for (let p of otonoamiParticles) {
    let force = p5.Vector.random3D().mult(random(3, 6) * strength);
    p.applyForce(force);
  }
  exploded = true;
  lastKickTime = millis();

  // 線の記録
  for (let i = 0; i < otonoamiParticles.length; i++) {
    for (let j = i + 1; j < otonoamiParticles.length; j++) {
      let a = otonoamiParticles[i];
      let b = otonoamiParticles[j];
      let d = p5.Vector.dist(a.pos, b.pos);
      if (d < connectionThreshold * 1.5) {
        registerConnection(a, b);
      }
    }
  }
}

// --- メイン描画 ---
function drawOtonoamiExplodingVisual() {
  let bass = getBass();
  let amp = getAmplitude();
  let now = millis();

  // 🎯 高音量：強く爆発（全線を見せる）
  if (amp > 0.3 && now - lastKickTime > kickCooldown) {
    triggerExplosion(1.5);
  }

  // 🎯 通常キック：軽く弾ける
  if (bass > 180 && amp <= 0.3 && now - lastKickTime > kickCooldown) {
    triggerExplosion(0.8);
  }

  // 🌀 球へ戻る（低音量）
  if (amp < returnThreshold && exploded) {
    for (let p of otonoamiParticles) {
      let force = p5.Vector.sub(p.basePos, p.pos).mult(0.02);
      p.applyForce(force);
    }
    // 全部戻ったら爆発状態解除
    let allClose = otonoamiParticles.every(p => p.pos.dist(p.basePos) < 5);
    if (allClose) {
      exploded = false;
      connectionMap.clear();
    }
  }

  // 🫧 波うち球変形（低音量時）
  if (!exploded) {
    for (let p of otonoamiParticles) {
      let noiseOffset = noise(p.id * 0.1, frameCount * 0.01);
      let bump = map(noiseOffset, 0, 1, -10, 10) * amp * 5;
      let dir = p.basePos.copy().normalize().mult(bump);
      let toShape = p5.Vector.sub(p.basePos.copy().add(dir), p.pos).mult(0.02);
      p.applyForce(toShape);
    }
  }

  // 更新と描画
  for (let p of otonoamiParticles) {
    p.update();
    p.display();
  }

  // 🔗 線の描画
  stroke(180, 60);
  for (let i = 0; i < otonoamiParticles.length; i++) {
    for (let j = i + 1; j < otonoamiParticles.length; j++) {
      let a = otonoamiParticles[i];
      let b = otonoamiParticles[j];
      if (shouldConnect(a, b)) {
        line(a.pos.x, a.pos.y, a.pos.z, b.pos.x, b.pos.y, b.pos.z);
      }
    }
  }
}
