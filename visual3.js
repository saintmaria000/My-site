let particles = [];
let numParticles = 800;
let radius = 250;

let spikeSources = [];
let spikeDuration = 300;
let lastSpikeTime = 0;

let lasers = [];
let laserDuration = 1200; // 1.2秒
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
    particles.push({ basePos, pos: basePos.copy(), id: i });
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

  // === キック検出 → レーザー発射 ===
  if (bass > 180 && now - lastSpikeTime > spikeDuration) {
    lastSpikeTime = now;
    let dir = p5.Vector.random3D();
    lasers.push({
      start: createVector(0, 0, 0),
      dir: dir,
      startTime: now
    });
  }

  // === レーザー描画 ===
  for (let l of lasers) {
    let elapsed = now - l.startTime;
    if (elapsed > laserDuration) continue;

    let progress = elapsed / laserDuration;
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

    // レーザー回避：レーザーの進行方向に近いものを押しのける
    for (let l of lasers) {
      let elapsed = now - l.startTime;
      if (elapsed > laserDuration) continue;

      let beamDir = l.dir;
      let projLength = p.basePos.dot(beamDir);
      let closestPoint = p5.Vector.mult(beamDir, projLength);
      let distToBeam = p.basePos.dist(closestPoint);

      if (distToBeam < 80) {
        let repel = p.basePos.copy().sub(closestPoint).normalize().mult(80 * (1 - elapsed / laserDuration));
        displacement.add(repel);
      }
    }

    // スペクトラムに合わせた波打ち（全体的な呼吸）
    let index = floor(map(p.id, 0, numParticles, 0, spectrum.length));
    let amp = map(spectrum[index], 0, 255, 0, 1);
    let normal = p.basePos.copy().normalize();
    displacement.add(normal.mult(amp * 24));

    // 緩やかに戻る
    let target = p.basePos.copy().add(displacement);
    p.pos.lerp(target, 0.22);
  }

  // === 明滅する中音線描画 ===
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
  lasers = lasers.filter(l => now - l.startTime < laserDuration);
}
