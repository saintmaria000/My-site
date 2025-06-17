//4

let particles = [];
let numParticles = 1000;
let radius = 250;

let lasers = [];
let lastLaserTime = 0;
let laserCooldown = 300;

let spectrum = [];
let orbs = [];       // 軌道魂
let sparkles = [];   // ポワポワ魂
let volumeHistory = [];

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
  sparkles = [];
  volumeHistory = [];
}

function drawVisual3() {
  background(0);
  orbitControl();

  let now = millis();
  let bass = fft.getEnergy(20, 60);
  let mid = fft.getEnergy(300, 2500);
  let treble = fft.getEnergy(6000, 12000);
  spectrum = fft.analyze();

  // 全体音量（Amplitudeベース）
  let vol = getVokumeLevel();
  volumeHistory.push(vol);
  if (volumeHistory.length > 10) volumeHistory.shift();

  // ===== レーザー発射（キック） =====
  if (bass > 180 && now - lastLaserTime > laserCooldown) {
    lastLaserTime = now;
    for (let i = 0; i < floor(random(1, 4)); i++) {
      lasers.push({
        start: createVector(0, 0, 0),
        dir: p5.Vector.random3D(),
        startTime: now,
        duration: random(1200, 2000)
      });
    }
  }

  // ===== 軌道魂（高音反応） =====
  if (treble > 108) {
    for (let i = 0; i < floor(random(1, 3)); i++) {
      orbs.push({
        angle: random(TWO_PI),
        speed: random(0.01, 0.03),
        axis: p5.Vector.random3D(),
        startTime: now,
        r: radius + random(10, 30)
      });
    }
  }

  // ===== ポワポワ魂（静寂トリガー）=====
  if (volumeHistory.length >= 2 && volumeHistory[volumeHistory.length - 2] > 0.12 && vol < 0.07) {
    for (let i = 0; i < 5; i++) {
      sparkles.push({
        pos: p5.Vector.random3D().mult(radius + random(10, 30)),
        startTime: now,
        lifespan: 1200 + random(300)
      });
    }
  }

  // === 軌道魂描画 ===
  for (let i = orbs.length - 1; i >= 0; i--) {
    let orb = orbs[i];
    let age = now - orb.startTime;
    if (age > 3000) {
      orbs.splice(i, 1);
      continue;
    }
    let t = age / 3000;
    let angle = orb.angle + t * TWO_PI * orb.speed * 60;
    let pos = createVector(orb.r * cos(angle), orb.r * sin(angle), 0);
    pos = rotateVectorAroundAxis(pos, orb.axis, angle);
    push();
    translate(pos.x, pos.y, pos.z);
    noStroke();
    fill(300, 100, 255, 100 * (1 - t));
    sphere(5);
    pop();
  }

  // === ポワポワ魂描画 ===
  for (let i = sparkles.length - 1; i >= 0; i--) {
    let s = sparkles[i];
    let age = now - s.startTime;
    if (age > s.lifespan) {
      sparkles.splice(i, 1);
      continue;
    }
    let alpha = map(sin(frameCount * 0.4 + i), -1, 1, 30, 100);
    push();
    translate(s.pos.x, s.pos.y, s.pos.z);
    noStroke();
    fill(200, 80, 255, alpha);
    sphere(2.5);
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

  // === パーティクル更新 ===
  for (let p of particles) {
    let displacement = createVector();

    for (let l of lasers) {
      let elapsed = now - l.startTime;
      if (elapsed > l.duration) continue;
      let dot = p.basePos.copy().normalize().dot(l.dir);
      if (dot < 0.4) continue;

      let beamDir = l.dir;
      let projLength = p.basePos.dot(beamDir);
      let closestPoint = p5.Vector.mult(beamDir, projLength);
      let distToBeam = p.basePos.dist(closestPoint);
      if (distToBeam < 60) {
        let repel = p.basePos.copy().sub(closestPoint).normalize().mult(60 * (1 - elapsed / l.duration));
        displacement.add(repel);
      }
    }

    let phiIndex = floor(map(p.phi, 0, PI, 0, spectrum.length));
    let amp = map(spectrum[phiIndex], 0, 255, 0, 1.8);
    let wave = sin(p.phi * 4 + frameCount * 0.1);
    let normal = p.basePos.copy().normalize();
    displacement.add(normal.mult(wave * amp * 30));
    let target = p.basePos.copy().add(displacement);
    p.pos.lerp(target, 0.28);
  }

  // === 中音メッシュ ===
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

  // === レーザー削除 ===
  lasers = lasers.filter(l => now - l.startTime < l.duration);
}

// 任意軸回転
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
