//4
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
  let anyLaserActive = lasers.some(l => now - l.startTime < l.duration);
  if (bass > 180 && !anyLaserActive) {
    lastLaserTime = now;
    let dir = p5.Vector.random3D();
    lasers.push({
      start: createVector(0, 0, 0),
      dir: dir,
      startTime: now,
      duration: random(1200, 2000)
    });
  }

  // === 魂（高音でオーブ出現） ===
  if (treble > 100 && random() < 0.5) {
    let angleOffset = random(TWO_PI);
    orbs.push({
      angle: angleOffset,
      speed: random(0.01, 0.03),
      axis: p5.Vector.random3D(),
      startTime: now
    });
  }

  // === 魂の描画 ===
  for (let i = orbs.length - 1; i >= 0; i--) {
    let orb = orbs[i];
    let age = now - orb.startTime;
    if (age > 2000) {
      orbs.splice(i, 1);
      continue;
    }
    let t = age / 2000;
    let r = radius + 10 + 20 * sin(t * TWO_PI * 2); // 軌道ゆらぎ
    let angle = orb.angle + t * TWO_PI * orb.speed;
    let pos = createVector(r * cos(angle), r * sin(angle), 0);
    pos = rotateVectorAroundAxis(pos, orb.axis, angle);

    push();
    translate(pos.x, pos.y, pos.z);
    noStroke();
    fill(300, 100, 255, 120 * (1 - t));
    sphere(5);
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

  // === パーティクル位置更新 ===
  for (let p of particles) {
    let displacement = createVector();

    // レーザー回避（後ろ側に影響しないよう dotで方向制限）
    for (let l of lasers) {
      let elapsed = now - l.startTime;
      if (elapsed > l.duration) continue;

      let toParticle = p.basePos.copy();
      let dot = toParticle.normalize().dot(l.dir);
      if (dot < 0.4) continue; // 反対側を無視（背面）

      let beamDir = l.dir;
      let projLength = p.basePos.dot(beamDir);
      let closestPoint = p5.Vector.mult(beamDir, projLength);
      let distToBeam = p.basePos.dist(closestPoint);

      if (distToBeam < 80) {
        let repel = p.basePos.copy().sub(closestPoint).normalize().mult(80 * (1 - elapsed / l.duration));
        displacement.add(repel);
      }
    }

    // スペクトラムによる波打ち（滑らかに）
    let phiIndex = floor(map(p.phi, 0, PI, 0, spectrum.length));
    let amp = map(spectrum[phiIndex], 0, 255, 0, 1.5);
    let wave = sin(p.phi * 4 + frameCount * 0.08);
    let normal = p.basePos.copy().normalize();
    displacement.add(normal.mult(wave * amp * 23));

    let target = p.basePos.copy().add(displacement);
    p.pos.lerp(target, 0.24);
  }

  // === 明滅する中音線 ===
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

  // === 古いレーザー除去 ===
  lasers = lasers.filter(l => now - l.startTime < l.duration);
}

// 補助：任意軸回転
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
