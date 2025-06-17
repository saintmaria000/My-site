// === パラメータ ===
const numParticles = 800;
const sphereRadius = 200;
const maxConnections = 4;
const connectionThreshold = 100;
const explosionForce = 25;
const meshDuration = 4; // フレーム数

let particles = [];
let meshConnections = [];
let lastKickTime = 0;
let kickCooldown = 300;

// === 初期化 ===
function initVisual3() {
  particles = [];
  for (let i = 0; i < numParticles; i++) {
    let phi = Math.acos(1 - 2 * (i + 0.5) / numParticles);
    let theta = Math.PI * (1 + Math.sqrt(5)) * i;
    let x = sphereRadius * Math.sin(phi) * Math.cos(theta);
    let y = sphereRadius * Math.sin(phi) * Math.sin(theta);
    let z = sphereRadius * Math.cos(phi);
    let pos = createVector(x, y, z);
    particles.push(new Particle3(pos, i));
  }
  meshConnections = [];
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
    this.vel.mult(0.9);
    this.acc.mult(0);
  }

  display() {
    push();
    translate(this.pos.x, this.pos.y, this.pos.z);
    noStroke();
    fill(220, 150, 255, 160);
    sphere(2);
    pop();
  }
}

// === キックによる爆発 ===
function triggerKickExplosion() {
  const seeds = [];
  while (seeds.length < 5) {
    let i = floor(random(particles.length));
    if (!seeds.includes(i)) seeds.push(i);
  }

  for (let i = 0; i < particles.length; i++) {
    let p = particles[i];
    let force = createVector();
    for (let sid of seeds) {
      let dir = p5.Vector.sub(p.pos, particles[sid].pos);
      force.add(dir.normalize());
    }
    force.div(seeds.length).mult(random(explosionForce * 0.5, explosionForce));
    p.applyForce(force);
  }

  lastKickTime = millis();
}

// === メッシュ接続 ===
function updateMesh() {
  meshConnections = [];

  for (let i = 0; i < particles.length; i++) {
    let a = particles[i];
    for (let j = i + 1; j < particles.length; j++) {
      let b = particles[j];
      let d = p5.Vector.dist(a.pos, b.pos);
      if (d < connectionThreshold) {
        meshConnections.push({ a: a, b: b, timer: meshDuration });
      }
    }
  }
}

// === メイン描画 ===
function drawVisual3() {
  background(0);
  orbitControl();

  let bass = getBass();
  let treble = getHi();
  let now = millis();

  if (bass > 180 && now - lastKickTime > kickCooldown) {
    triggerKickExplosion();
  }

  if (treble > 150) {
    updateMesh();
  }

  // update + draw particles
  for (let p of particles) {
    // 戻る力を適用
    let restoringForce = p5.Vector.sub(p.basePos, p.pos).mult(0.01);
    p.applyForce(restoringForce);

    p.update();
    p.display();
  }

  // draw fading mesh lines
  for (let i = meshConnections.length - 1; i >= 0; i--) {
    let m = meshConnections[i];
    if (m.timer-- <= 0) {
      meshConnections.splice(i, 1);
      continue;
    }
    stroke(200, 100, 255, map(m.timer, 0, meshDuration, 0, 255));
    strokeWeight(1);
    line(m.a.pos.x, m.a.pos.y, m.a.pos.z, m.b.pos.x, m.b.pos.y, m.b.pos.z);
  }
}
