// === パラメータ設定 ===!!
let numParticles = 250;
let connectionThreshold = 120;
let sphereRadius = 200;
let maxConnections = 3;
let explosionDistance = 800;

// === 状態変数 ===
let otonoamiParticles = [];
let exploded = false;
let lastKickTime = 0;
let kickCooldown = 300;
let connectionMap = new Set();

// === 初期化処理 ===
function initOtonoamiParticles() {
  otonoamiParticles = [];
  for (let i = 0; i < numParticles; i++) {
    let phi = Math.acos(1 - 2 * (i + 0.5) / numParticles);
    let theta = Math.PI * (1 + Math.sqrt(5)) * i;
    let r = sphereRadius;
    let x = r * Math.sin(phi) * Math.cos(theta);
    let y = r * Math.sin(phi) * Math.sin(theta);
    let z = r * Math.cos(phi);
    let pos = createVector(x, y, z);
    otonoamiParticles.push(new Particle(pos, i));
  }
  exploded = false;
  connectionMap.clear();
}

// === パーティクルクラス ===
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
    this.vel.mult(0.92);
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

// === 爆発処理（キック反応） ===
function triggerExplosion() {
  let sources = [];
  while (sources.length < 5) {
    let candidate = floor(random(otonoamiParticles.length));
    if (!sources.includes(candidate)) sources.push(candidate);
  }

  for (let p of otonoamiParticles) {
    let force = createVector();
    for (let sid of sources) {
      let dir = p5.Vector.sub(p.pos, otonoamiParticles[sid].pos).normalize();
      force.add(dir);
    }
    force.normalize().mult(random(10, 25));
    p.applyForce(force);
  }

  exploded = true;
  lastKickTime = millis();
  registerOuterConnections();
}

// === 外殻接続記録 ===
function registerOuterConnections() {
  connectionMap.clear();
  for (let i = 0; i < otonoamiParticles.length; i++) {
    let a = otonoamiParticles[i];
    if (a.pos.mag() <= sphereRadius) continue;
    for (let j = i + 1; j < otonoamiParticles.length; j++) {
      let b = otonoamiParticles[j];
      if (b.pos.mag() <= sphereRadius) continue;
      if (p5.Vector.dist(a.pos, b.pos) < connectionThreshold) {
        connectionMap.add([a.id, b.id].sort().join("-"));
      }
    }
  }
}

function shouldConnect(a, b) {
  return connectionMap.has([a.id, b.id].sort().join("-"));
}

// === メイン描画関数 ===
function drawOtonoamiExplodingVisual() {
  background(0);
  orbitControl();

  let bass = getBass();
  let mid = getMid();
  let treble = getHi();
  let amp = getAmplitude();
  let now = millis();

  // キック検出
  if (bass > 180 && now - lastKickTime > kickCooldown) {
    triggerExplosion();
  }

  // 波打ち表現：中音 + 高音で
  for (let p of otonoamiParticles) {
    let factor = map(mid + treble, 0, 300, 0, 1);
    let offset = sin(p.id * 0.3 + frameCount * 0.08) * factor * 15;
    let normal = p.basePos.copy().normalize();
    let target = p.basePos.copy().add(normal.mult(offset));
    let restoring = p5.Vector.sub(target, p.pos).mult(0.05);
    p.applyForce(restoring);

    // 球へ戻す力
    let back = p5.Vector.sub(p.basePos, p.pos).mult(0.01);
    p.applyForce(back);
  }

  // 爆発 → 全員戻ったら解除
  if (exploded) {
    let allClose = otonoamiParticles.every(p => p.pos.dist(p.basePos) < 5);
    if (allClose) exploded = false;
  }

  // 更新と描画
  for (let p of otonoamiParticles) {
    p.update();
    p.display();
  }

  // 高音で線描画
  if (treble > 80) {
    for (let i = 0; i < otonoamiParticles.length; i++) {
      let a = otonoamiParticles[i];
      let conns = [];
      for (let j = 0; j < otonoamiParticles.length; j++) {
        if (i === j) continue;
        let b = otonoamiParticles[j];
        if (shouldConnect(a, b)) {
          let d = p5.Vector.dist(a.pos, b.pos);
          conns.push({ p: b, dist: d });
        }
      }

      conns.sort((a, b) => a.dist - b.dist);
      for (let k = 0; k < Math.min(maxConnections, conns.length); k++) {
        let n = conns[k];
        strokeWeight(map(n.dist, 0, connectionThreshold, 2.5, 0.8));
        stroke(220, 100, 255, map(n.dist, 0, connectionThreshold, 255, 90));
        line(a.pos.x, a.pos.y, a.pos.z, n.p.pos.x, n.p.pos.y, n.p.pos.z);
      }
    }
  }
}
