let fireParticles = [];
let gridCols = 200;
let gridRows = 120;

function initVisual4() {
  fireParticles = [];

  let xSpacing = width / gridCols;
  let ySpacing = height / gridRows;

  for (let i = 0; i < gridCols; i++) {
    for (let j = 0; j < gridRows; j++) {
      let x = i * xSpacing - width / 2 + xSpacing / 2;
      let y = j * ySpacing - height + ySpacing / 2;

      fireParticles.push({
        x: x,
        y: y
      });
    }
  }
}

function drawVisual4() {
  push();
  translate(width / 2, height);
  noStroke();
  colorMode(HSB, 360, 100, 100, 100);
  background(0, 0, 0, 20); // 黒背景に軽い残像

  let t = frameCount * 0.05;
  let waveHeight = height;
  let waveSpeed = 0.01;
  let waveY = (x) => sin(x * waveSpeed + t) * waveHeight;

  for (let p of fireParticles) {
    let waveCenterY = waveY(p.x);
    let distance = abs(p.y - waveCenterY);
    let threshold = 60; // 波の影響範囲

    // 0 = 波の中心（最大影響）、threshold = 外側（通常色）
    let intensity = constrain(1 - distance / threshold, 0, 1);

    // 通常色 → 波中心色（橙 → 青白）への補間
    let hue = lerp(30, 200, intensity);  // HSB: 30=橙, 200=青
    let sat = lerp(100, 50, intensity);
    let bri = lerp(100, 100, intensity);
    let alpha = lerp(20, 100, intensity); // 中心ほど明るく

    fill(hue, sat, bri, alpha);
    ellipse(p.x, p.y, 2, 2);
  }

  pop();
}
