// === パラメータ ===
let numParticles = 800;
let sphereRadius = 200;
let connectionThreshold = 90;
let maxConnections = 3;
let kickCooldown = 300;
let explosionForce = 16;

// === 状態変数 ===
let particles = [];
let lastKickTime = 0;
let connectionMap = new Set();

// === 初期化 ===
function initVisual3() {
  particles = [];
  for (let i = 0; i < numParticles; i++) {
    let phi = Math.acos(1 - 2 * (i + 0.5) / numParticles);
    let theta = Math.PI * (1 + Math.sqrt(5)) * i;
    let r = sphereRadius;
    let x = r * Math.sin(phi) * Math.cos(theta);
    let y = r * Math.sin(phi) * Math.sin(theta);
    let z = r * Math.cos(phi);
    let pos = createVector(x, y, z);
    particles.push(new Particle3(pos, i));
  }
}

// === パーティクルクラス ===
class Particle3 {
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
    this.vel.mult(0.90);
  }

  display() {
    push();
    translate(this.pos.x, this.pos.y, this.pos.z);
    noStroke();
    fill(180, 200, 255, 160);
    sphere(2.2);
    pop();
  }
}

// === 接続線管理 ===
function registerMeshConnections() {
  connectionMap.clear();
  for (let i = 0; i < particles.length; i++) {
    let a = particles[i];
    for (let j = i + 1; j < particles.length; j++) {
      let b = particles[j];
      let d = p5.Vector.dist(a.pos, b.pos);
      if (d < connectionThreshold) {
        let key = [a.id, b.id].sort().join("-");
        connectionMap.add(key);
      }
    }
  }
}

function shouldConnect(a, b) {
  return connectionMap.has([a.id, b.id].sort().join("-"));
}

// === キックによる放射演出 ===
function triggerKickExplosion() {
  let sources = [];
  while (sources.length < 6) {
    let candidate = floor(random(particles.length));
    if (!sources.includes(candidate)) sources.push(candidate);
  }

  for (let p of particles) {
    let totalForce = createVector();
    for (let sid of sources) {
      let dir = p5.Vector.sub(p.pos, particles[sid].pos).normalize();
      totalForce.add(dir);
    }
    totalForce.normalize().mult(explosionForce);
    p.applyForce(totalForce);
  }

  lastKickTime = millis();
  registerMeshConnections();
}

// === メイン描画関数 ===
function drawVisual3() {
  background(0);
  orbitControl();

  let bass = getBass();
  let mid = getMid();
  let treble = getHi();
  let spectrum = fft.analyze();
  let now = millis();

  // === Kick で爆発的に放射 ===
  if (bass > 180 && now - lastKickTime > kickCooldown) {
    triggerKickExplosion();
  }

  // === 波打ち（スペクトラム → 球表面） ===
  for (let i = 0; i < particles.length; i++) {
    let p = particles[i];
    let bandIdx = floor(map(i, 0, particles.length, 0, spectrum.length));
    let amp = spectrum[bandIdx] / 255.0;
    let offset = amp * 35;

    let normal = p.basePos.copy().normalize();
    let target = p.basePos.copy().add(normal.mult(offset));
    let force = p5.Vector.sub(target, p.pos).mult(0.1);
    p.applyForce(force);
  }

  // === 更新 & 表示 ===
  for (let p of particles) {
    p.update();
    p.display();
  }

  // === メッシュ可視化（中高音）===
  if ((mid + treble) > 180) {
    stroke(120, 200, 255, 90);
    strokeWeight(1.3);
    for (let i = 0; i < particles.length; i++) {
      let a = particles[i];
      for (let j = i + 1; j < particles.length; j++) {
        let b = particles[j];
        if (shouldConnect(a, b)) {
          line(a.pos.x, a.pos.y, a.pos.z, b.pos.x, b.pos.y, b.pos.z);
        }
      }
    }
  }
}
