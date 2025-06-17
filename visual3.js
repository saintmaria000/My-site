let particles = [];
let numParticles = 800;
let radius = 250;
let spikeSources = [];
let spikeDuration = 200;
let lastSpikeTime = 0;

let laserBeams = [];
let laserDuration = 0;
let laserStartTime = 0;

function initVisual3() {
  particles = [];
  for (let i = 0; i < numParticles; i++) {
    let phi = Math.acos(1 - 2 * (i + 0.5) / numParticles);
    let theta = Math.PI * (1 + Math.sqrt(5)) * i;
    let x = radius * Math.sin(phi) * Math.cos(theta);
    let y = radius * Math.sin(phi) * Math.sin(theta);
    let z = radius * Math.cos(phi);
    let pos = createVector(x, y, z);
    particles.push({
      basePos: pos.copy(),
      pos: pos.copy(),
      vel: createVector(),
      id: i
    });
  }
}

function drawVisual3() {
  background(0);
  orbitControl();

  let bass = fft.getEnergy(20, 60);
  let mid = fft.getEnergy(400, 2500);

  // --- Kick で Spike & Laser 発生 ---
  if (bass > 180 && millis() - lastSpikeTime > spikeDuration) {
    spikeSources = [];
    for (let i = 0; i < 4; i++) {
      spikeSources.push(floor(random(particles.length)));
    }
    lastSpikeTime = millis();

    // Laser init
    laserBeams = [];
    for (let i = 0; i < 3; i++) {
      let dir = p5.Vector.random3D();
      laserBeams.push(dir);
    }
    laserDuration = random(1200, 3000);
    laserStartTime = millis();
  }

  let spikeProgress = constrain((millis() - lastSpikeTime) / spikeDuration, 0, 1);

  // --- Particle update ---
  for (let i = 0; i < particles.length; i++) {
    let p = particles[i];
    let disp = createVector(0, 0, 0);

    // スパイク拡張
    for (let s of spikeSources) {
      let d = p.basePos.dist(particles[s].basePos);
      if (d < 100) {
        let dir = p.basePos.copy().sub(particles[s].basePos).normalize();
        let strength = map(d, 0, 100, 1, 0) * (1 - spikeProgress);
        disp.add(dir.mult(300 * strength));
      }
    }

    // レーザー回避
    if (millis() - laserStartTime < laserDuration) {
      for (let beam of laserBeams) {
        let toP = p.pos.copy().normalize();
        let angle = degrees(beam.angleBetween(toP));
        if (angle < 10) {
          let away = toP.copy().mult(15);
          disp.add(away);
        }
      }
    }

    // 振動（スペクトラム）
    let osc = sin(p.id * 0.3 + frameCount * 0.1) * map(mid, 0, 255, 0, 10);
    let nrm = p.basePos.copy().normalize().mult(osc);
    disp.add(nrm);

    // apply & update
    p.pos = p5.Vector.lerp(p.pos, p.basePos.copy().add(disp), 0.25);
  }

  // --- Draw mesh lines (mid反応で明滅) ---
  if (mid > 80) {
    strokeWeight(1);
    colorMode(HSB, 360, 100, 100, 100);
    for (let i = 0; i < particles.length; i++) {
      let a = particles[i];
      for (let j = i + 1; j < particles.length; j++) {
        let b = particles[j];
        let d = a.pos.dist(b.pos);
        if (d < 50) {
          let alpha = map(mid, 0, 255, 0, 100);
          stroke(180, 80, 100, alpha);
          line(a.pos.x, a.pos.y, a.pos.z, b.pos.x, b.pos.y, b.pos.z);
        }
      }
    }
  }

  // --- Draw laser beams ---
  if (millis() - laserStartTime < laserDuration) {
    strokeWeight(6);
    stroke(200, 100, 100, 180);
    for (let dir of laserBeams) {
      let start = createVector(0, 0, 0);
      let end = p5.Vector.mult(dir, 1000);
      line(start.x, start.y, start.z, end.x, end.y, end.z);
    }
  }

  // --- Draw particles ---
  noStroke();
  fill(200, 100, 255);
  for (let p of particles) {
    push();
    translate(p.pos.x, p.pos.y, p.pos.z);
    sphere(2);
    pop();
  }
}
