// visual.js
let stars = [];
let limStars = 300;
let RANGE = 600;

let spectrum = fft.analyze();
let rms = amplitude.getLevel();

 orbitControl(); // マウス操作で回転できる

  // 🌟 中央の鼓動するスフィア
  let size = 10 + rms * 200;
  push();
  noStroke();
  fill(60, 80, 100);
  sphere(size);
  pop();

  // 🌌 銀河風の星を描画
  rotateY(frameCount * 0.002); // ゆっくり回転
  noStroke();
  for (let i = 0; i < stars.length; i++) {
    let p = stars[i];
    push();
    translate(p.x, p.y, p.z);
    fill(p.hue, 60, 100);
    sphere(2); // 星のサイズ
    pop();
  }
}

function initGalaxyStars() {
  let arms = 4;              // 銀河の腕の数
  let spread = 0.3;          // 星のばらつき具合
  for (let i = 0; i < limStars; i++) {
    let arm = i % arms;
    let distance = random(50, RANGE); // 中心からの距離
    let angle = arm / arms * TWO_PI + distance * 0.02 + random(-0.5, 0.5);
    let x = distance * cos(angle) + randomGaussian() * distance * spread;
    let y = distance * sin(angle) + randomGaussian() * distance * spread;
    let z = random(-RANGE / 4, RANGE / 4);
    let hue = map(distance, 50, RANGE, 180, 300); // 外側ほど青く
    stars.push(new Star(x, y, z, hue));
  }
}

class Star {
  constructor(x, y, z, hue) {
    this.x = x;
    this.y = y;
    this.z = z;
    this.hue = hue;
  }
}
