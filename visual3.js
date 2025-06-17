let particles = [];
let numParticles = 1000;
let radius = 250;
let lasers = [];
let lastLaserTime = 0;
let laserCooldown = 300;
let spectrum = [];

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
}

function drawVisual3() {
  background(0);
  orbitControl();

  let bass = fft.getEnergy(20, 60);
  let mid = fft.getEnergy(300, 2500);
  spectrum = fft.analyze();
  let now = millis();

  // === レーザー発射（Kick反応）===
  if (bass > 180 && now - lastLaserTime > laserCooldown) {
    lastLaserTime = now;
    let dir = p5.Vector.random3D();
    lasers.push({
      start: createVector(0, 0, 0),
      dir: dir,
      startTime: now,
      duration: random(1200, 2000)  // ★ ランダム持続時間（1.2〜2秒）
    });
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

    // レーザー通過時だけ穴（避ける）を作る
    for (let l of lasers) {
      let elapsed = now - l.startTime;
      if (elapsed > l.duration) continue;

      let beamDir = l.dir;
      let projLength = p.basePos.dot(beamDir);
      let closestPoint = p5.Vector.mult(beamDir, projLength);
      let distToBeam = p.basePos.dist(closestPoint);

      if (distToBeam < 80) {
        let repel = p.basePos.copy().sub(closestPoint).normalize().mult(80 * (1 - elapsed / l.duration));
        displacement.add(repel);
      }
    }

    // 波打ち（スペクトラム反映、穴にならないように調整）
    let phiIndex = floor(map(p.phi, 0, PI, 0, spectrum.length));
    let amp = map(spectrum[phiIndex], 0, 255, 0, 1.5);
    let wave = sin(p.phi * 4 + frameCount * 0.08);
    let normal = p.basePos.copy().normalize();
    displacement.add(normal.mult(wave * amp * 23));

    let target = p.basePos.copy().add(displacement);
    p.pos.lerp(target, 0.24);
  }

  // === 線描画（中音に反応したビリビリ明滅） ===
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
