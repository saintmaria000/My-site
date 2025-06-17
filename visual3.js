//3
let particles = [];
let lasers = [];
let orbs = [];
let spectrum = [];

let lastLaserTime = 0;
let laserCooldown = 300;
const laserRange = 80;
const laserLength = 2000;
const bpm = 140;
const orbLifetime = 3000;
const numParticles = 1000;
const radius = 250;

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

  // === Laser (Kick)
  if (bass > 180 && now - lastLaserTime > laserCooldown) {
    lastLaserTime = now;
    let numLasers = floor(random(1, 3));
    for (let i = 0; i < numLasers; i++) {
      let dir = p5.Vector.random3D();
      lasers.push({
        start: createVector(0, 0, 0),
        dir,
        startTime: now,
        duration: random(1200, 2000)
      });
    }
  }

  // === Orbs (Treble)
  if (treble > 100 && random() < 0.5) {
    let axis = p5.Vector.random3D();
    let angle = random(TWO_PI);
    let speed = (2 * PI) / (60 / bpm * 1000);  // rad/ms
    orbs.push({
      axis,
      angle,
      speed,
      startTime: now,
      trail: []
    });
  }

  // === Orbs Draw
  for (let i = orbs.length - 1; i >= 0; i--) {
    let orb = orbs[i];
    let age = now - orb.startTime;
    if (age > orbLifetime) {
      orbs.splice(i, 1);
      continue;
    }

    let t = age / orbLifetime;
    orb.angle += orb.speed * deltaTime;
    let r = radius + 30 + 10 * sin(t * TWO_PI * 2); // ゆらぎ

    let pos = createVector(r * cos(orb.angle), r * sin(orb.angle), 0);
    pos = rotateVectorAroundAxis(pos, orb.axis, orb.angle);
    orb.trail.push(pos.copy());
    if (orb.trail.length > 15) orb.trail.shift();

    noStroke();
    for (let j = 0; j < orb.trail.length; j++) {
      let trailAlpha = map(j, 0, orb.trail.length, 0, 80);
      let p = orb.trail[j];
      push();
      translate(p.x, p.y, p.z);
      fill(300, 100, 255, trailAlpha);
      sphere(3);
      pop();
    }

    push();
    translate(pos.x, pos.y, pos.z);
    fill(300, 100, 255, 120 * (1 - t));
    sphere(6);
    pop();
  }

  // === Laser Draw
  for (let l of lasers) {
    let elapsed = now - l.startTime;
    if (elapsed > l.duration) continue;

    let t = elapsed / l.duration;
    let beamWidth = 8 * (1 - abs(sin(t * PI)));
    let alpha = map(1 - t, 0, 1, 0, 100);
    let endPos = p5.Vector.add(l.start, p5.Vector.mult(l.dir, laserLength));
    push();
    strokeWeight(beamWidth);
    colorMode(HSB, 360, 100, 100, 100);
    stroke(200, 100, 100, alpha);
    line(l.start.x, l.start.y, l.start.z, endPos.x, endPos.y, endPos.z);
    pop();
  }

  // === Particle Update
  for (let p of particles) {
    let displacement = createVector();

    // Laser Repel
    for (let l of lasers) {
      let elapsed = now - l.startTime;
      if (elapsed > l.duration) continue;

      let toParticle = p.basePos.copy().normalize();
      if (toParticle.dot(l.dir) < 0.4) continue;

      let proj = p.basePos.dot(l.dir);
      let beamPoint = p5.Vector.mult(l.dir, proj);
      let dist = p.basePos.dist(beamPoint);
      if (dist < laserRange) {
        let repel = p.basePos.copy().sub(beamPoint).normalize().mult((laserRange - dist));
        displacement.add(repel);
      }
    }

    // Spectrum Wave (phi軸に沿って滑らか)
    let phiIndex = floor(map(p.phi, 0, PI, 0, spectrum.length));
    let amp = map(spectrum[phiIndex], 0, 255, 0, 1.5);
    let wave = sin(p.phi * 4 + frameCount * 0.08);
    let normal = p.basePos.copy().normalize();
    displacement.add(normal.mult(wave * amp * 23));

    let target = p.basePos.copy().add(displacement);
    p.pos.lerp(target, 0.24);
  }

  // === Wireframe (Mid)
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

  // === Particle Draw
  noStroke();
  fill(190, 100, 255);
  for (let p of particles) {
    push();
    translate(p.pos.x, p.pos.y, p.pos.z);
    sphere(2);
    pop();
  }

  // === Laser cleanup
  lasers = lasers.filter(l => now - l.startTime < l.duration);
}

// === ヘルパー：任意軸回転 ===
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
