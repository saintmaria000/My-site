let particles = [];
const maxParticles = 12000;
const baseEmissionRate = 50;
const flowFieldScale = 0.01;
const reflowChance = 0.2;

// 迷子関連
const lostChance = 0.002;
const lostDuration = 300; // frames
const followChance = 0.1;

function initVisual4() {
  particles = [];
}

function drawVisual4() {
  noStroke();
  fill(0, 10);
  rect(0, 0, width, height);
  colorMode(HSB, 360, 100, 100, 100);

  let emissionRate = baseEmissionRate;
  while (particles.length < maxParticles && emissionRate-- > 0) {
    const edge = random(["left", "right", "bottom"]);
    const x = (edge === "left") ? 0 :
              (edge === "right") ? width : random(width);
    const y = (edge === "bottom") ? height : height / 2 + random(height / 2);
    particles.push({
      pos: createVector(x, y),
      alpha: 0,
      state: "normal",
      lostTimer: 0
    });
  }

  const kick = isKick();

  for (const p of particles) {
    // === 状態遷移 ===
    if (p.state === "normal" && random() < lostChance) {
      p.state = "lost";
      p.lostTimer = lostDuration;
    } else if (p.state === "lost") {
      p.lostTimer--;
      if (p.lostTimer <= 0) {
        p.state = "normal";
      }
    }

    // === 移動方向 ===
    let angle;
    if (p.state === "lost") {
      angle = noise(p.pos.x * 0.005, p.pos.y * 0.005, frameCount * 0.01) * TWO_PI * 4;
    } else {
      angle = noise(p.pos.x * flowFieldScale, p.pos.y * flowFieldScale, frameCount * 0.005) * TWO_PI * 2;

      // 迷子の近くにいれば追随
      for (const other of particles) {
        if (other !== p && other.state === "lost" && dist(p.pos.x, p.pos.y, other.pos.x, other.pos.y) < 50) {
          if (random() < followChance) {
            let toOther = p5.Vector.sub(other.pos, p.pos);
            angle = toOther.heading();
            break;
          }
        }
      }
    }

    const v = p5.Vector.fromAngle(angle).mult(1.2);
    p.pos.add(v);

    // === ワープ処理（軌道描画しない）===
    if (p.pos.x < 0 || p.pos.x > width) {
      p.pos.x = (p.pos.x < 0) ? width : 0;
      if (random() < reflowChance) p.pos.y = random(height);
      continue;
    }
    if (p.pos.y < 0 || p.pos.y > height) {
      p.pos.y = (p.pos.y < 0) ? height : 0;
      if (random() < reflowChance) p.pos.x = random(width);
      continue;
    }

    // === フェードイン ===
    if (p.alpha < 100) p.alpha += 2;

    // === 描画（キック時白）===
    const hue = 10 + noise(p.pos.x * 0.01, p.pos.y * 0.01) * 20;
    const alpha = p.alpha;
    fill(kick ? color(0, 0, 100, alpha) : color(hue, 100, 100, alpha));
    ellipse(p.pos.x, p.pos.y, 2, 2);
  }
}
