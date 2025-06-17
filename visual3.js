let sphereParticles = [];
let particleCount = 800;
let sphereRadius = 200;
let connectionThreshold = 100;
let maxConnections = 3;
let spectrumBands = 64;
let connections = new Set();
let activeBursts = [];

function initOtonoamiParticles() {
  sphereParticles = [];
  for (let i = 0; i < particleCount; i++) {
    let phi = Math.acos(1 - 2 * (i + 0.5) / particleCount);
    let theta = Math.PI * (1 + Math.sqrt(5)) * i;
    let r = sphereRadius;
    let x = r * Math.sin(phi) * Math.cos(theta);
    let y = r * Math.sin(phi) * Math.sin(theta);
    let z = r * Math.cos(phi);
    let pos = createVector(x, y, z);
    sphereParticles.push(new Particle(pos, i));
  }
  connections.clear();
  activeBursts = [];
}

class Particle {
  constructor(pos, id) {
    this.id = id;
    this.basePos = pos.copy();
    this.pos = pos.copy();
    this.vel = createVector();
    this.acc = createVector();
    this.ampFactor = 0;
  }

  applyForce(force) {
    this.acc.add(force);
  }

  update() {
    this.vel.add(this.acc);
    this.pos.add(this.vel);
    this.acc.mult(0);
    this.vel.mult(0.9);
  }

  display() {
    push();
    translate(this.pos.x, this.pos.y, this.pos.z);
    noStroke();
    fill(180, 130, 255, 180);
    sphere(2.2);
    pop();
  }
}

function drawOtonoamiExplodingVisual() {
  background(0);
  orbitControl();

  let spectrum = fft.analyze();
  let bass = fft.getEnergy(20, 60);
  let treble = fft.getEnergy(8000, 12000);
  let now = millis();

  // 面のうねり（スペクトラムから直接）
  for (let i = 0; i < sphereParticles.length; i++) {
    let p = sphereParticles[i];
    let bandIdx = floor(map(i, 0, particleCount, 0, spectrumBands));
    let amp = spectrum[bandIdx] || 0;
    let offset = map(amp, 0, 255, 0, 30);
    let dir = p.basePos.copy().normalize().mult(offset);
    let target = p.basePos.copy().add(dir);
    let force = p5.Vector.sub(target, p.pos).mult(0.12);
    p.applyForce(force);
  }

  // Kickによる部分弾け
  if (bass > 180 && random() < 0.3) {
    let burstCenter = floor(random(sphereParticles.length));
    activeBursts.push({ id: burstCenter, start: now });
  }

  // 弾けた点を中心に周囲を巻き込んで膨張
  for (let burst of activeBursts) {
    if (now - burst.start > 180) continue;
    let origin = sphereParticles[burst.id].basePos;
    for (let p of sphereParticles) {
      let d = p.basePos.dist(origin);
      if (d < 80) {
        let dir = p.basePos.copy().sub(origin).normalize().mult(25);
        p.applyForce(dir);
      }
    }
  }

  // 更新・描画
  for (let p of sphereParticles) {
    p.update();
    p.display();
  }

  // 線の一時描画（高音）
  connections.clear();
  if (treble > 100) {
    for (let i = 0; i < sphereParticles.length; i++) {
      let a = sphereParticles[i];
      for (let j = i + 1; j < sphereParticles.length; j++) {
        let b = sphereParticles[j];
        let d = a.pos.dist(b.pos);
        if (d < connectionThreshold) {
          let key = [a.id, b.id].join("-");
          connections.add(key);
        }
      }
    }
  }

  // 点滅的に描画
  stroke(255, 200);
  for (let key of connections) {
    if (random() < 0.3) continue; // 点滅
    let ids = key.split("-").map(Number);
    let a = sphereParticles[ids[0]];
    let b = sphereParticles[ids[1]];
    strokeWeight(1.5);
    line(a.pos.x, a.pos.y, a.pos.z, b.pos.x, b.pos.y, b.pos.z);
  }
}
