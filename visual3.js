//2
let particles = [];
let numParticles = 1000;
let radius = 250;

let lasers = [];
let lastLaserTime = 0;
let laserCooldown = 300;
let spectrum = [];

let orbs = [];

function initVisual3() {
  particles = [];
  for (let i = 0; i < numParticles; i++) {
    let phi = Math.acos(1 - 2 * (i + 0.5) / numParticles);
    let theta = Math.PI * (1 + Math.sqrt(5)) * i;
    let x = radius * Math.sin(phi) * Math.cos(theta);
    let y = radius * Math.sin(phi) * Math.sin(theta);
    let z = radius * Math.cos(phi);
    let basePos = createVector(x, y, z);
    particles.push({ basePos, pos: basePos.copy(), id: i, phi });
  }
  lasers = [];
  orbs = [];
}

function drawVisual3() {
  background(0);
  orbitControl();

  let now = millis();
  let bass = fft.getEnergy(20, 60);
  let mid = fft.getEnergy(300, 2500);
  let treble = fft.getEnergy(6000, 12000);
  spectrum = fft.analyze();

  // === レーザー発射 ===
  if (bass > 180 && now - lastLaserTime > laserCooldown) {
    lastLaserTime = now;
    lasers.push({
      start: createVector(0, 0, 0),
      dir: p5.Vector.random3D(),
      startTime: now,
      duration: random(1200, 2000)
    });
  }

  // === 魂（トレイル付き） ===
  if (treble > 90 && random() < 0.4) {
    orbs.push({
      startTime: now,
      axis: p5.Vector.random3D(),
      baseAngle: random(TWO_PI),
      speed: random(0.015, 0.03),
      eccentricity: random(0.7, 1.3),
      trail: []
    });
  }

  for (let i = orbs.length - 1; i >= 0; i--) {
    let orb = orbs[i];
    let age = now - orb.startTime;
    if (age > 3000) {
      orbs.splice(i, 1);
      continue;
    }
    let t = age / 3000;
    let angle = orb.baseAngle + t * TWO_PI * orb.speed;
    let r = radius + 30;
    let pos = createVector(r * cos(angle), r * sin(angle) * orb.eccentricity, 0);
    pos = rotateVectorAroundAxis(pos, orb.axis, angle);
    orb.trail.push(pos.copy());
    if (orb.trail.length > 20) orb.trail.shift();

    noFill();
    stroke(300, 100, 255, 100);
    beginShape();
    for (let pt of orb.trail) {
      vertex(pt.x, pt.y, pt.z);
    }
    endShape();

    push();
    translate(pos.x, pos.y, pos.z);
    noStroke();
    fill(300, 100, 255, 180);
    sphere(4);
    pop();
  }

  // === レーザー描画 ===
  for (let l of lasers) {
    let elapsed = now - l.startTime;
    if (elapsed > l.duration) continue;
    let progress = elapsed / l.duration;
    let beamWidth = 8 * (1 - abs(sin(progress * PI)));
    let alpha = map(1 - progress, 0, 1, 0, 100);
    let endPos = p5.Vector.add(l.start, p5.Vector.mult(l.dir, 2000));

    push();
    strokeWeight(beamWidth);
    colorMode(HSB, 360, 100, 100, 100);
    stroke(200, 100, 100, alpha);
    line(l.start.x, l.start.y, l.start.z, endPos.x, endPos.y, endPos.z);
    pop();
  }

  // === パーティクル処理 ===
  for (let p of particles) {
    let displacement = createVector();

    // レーザー回避（正面のみ）
    for (let l of lasers) {
      let elapsed = now - l.startTime;
      if (elapsed > l.duration) continue;
      let dot = p.basePos.copy().normalize().dot(l.dir);
      if (dot < 0.4) continue;

      let closest = p5.Vector.mult(l.dir, p.basePos.dot(l.dir));
      let d = p.basePos.dist(closest);
      if (d < 80) {
        let repel = p.basePos.copy().sub(closest).normalize().mult(80 * (1 - elapsed / l.duration));
        displacement.add(repel);
      }
    }

    // 波（連続性のあるスペクトラム）
    let phiIndex = floor(map(p.phi, 0, PI, 0, spectrum.length));
    let amp = map(spectrum[phiIndex], 0, 255, 0, 1.5);
    let wave = sin(p.phi * 4 + frameCount * 0.08);
    let normal = p.basePos.copy().normalize();
    displacement.add(normal.mult(wave * amp * 23));

    p.pos.lerp(p.basePos.copy().add(displacement), 0.24);
  }

  // === 線（中音）===
  for (let i = 0; i < particles.length; i++) {
    let a = particles[i];
    for (let j = i + 1; j < particles.length; j++) {
      let b = particles[j];
      let d = a.pos.dist(b.pos);
      if (d < 50 && random() < 0.5) {
        let alpha = map(mid, 0, 255, 0, 100);
        strokeWeight(1);
        stroke(180, 100, 100, alpha);
        line(a.pos.x, a.pos.y, a.pos.z, b.pos.x, b.pos.y, b.pos.z);
      }
    }
  }

  // === パーティクル描画 ===
  noStroke();
  fill(190, 100, 255);
  for (let p of particles) {
    push();
    translate(p.pos.x, p.pos.y, p.pos.z);
    sphere(2);
    pop();
  }

  lasers = lasers.filter(l => now - l.startTime < l.duration);
}

// 任意軸回転補助関数
function rotateVectorAroundAxis(vec, axis, angle) {
  let cosA = cos(angle);
  let sinA = sin(angle);
  let dot = vec.dot(axis);
  return p5.Vector.add(
    p5.Vector.mult(vec, cosA),
    p5.Vector.add(
      p5.Vector.mult(p5.Vector.cross(axis, vec), sinA),
      p5.Vector.mult(axis, dot * (1 - cosA))
    )
  );
}
