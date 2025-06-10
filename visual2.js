// === visual2.js ===
// 【Galaxy Visual】星々が腕に沿って配置され、中心スフィアが鼓動する3D表現

let stars = [];
let limStars = 600;
let RANGE = 800;

/**
 * 銀河風に星を初期化
 */
function initGalaxyStars() {
  let arms = 7;
  let spread = 0.3;
  stars = [];

  for (let i = 0; i < limStars; i++) {
    let arm = i % arms;
    let distance = random(50, RANGE);
    let angle = arm / arms * TWO_PI + distance * 0.02;
    angle += sin(distance * 0.1 + frameCount * 0.01) * 0.3;

    let x = distance * cos(angle) + randomGaussian() * distance * spread;
    let y = distance * sin(angle) + randomGaussian() * distance * spread;
    let z = random(-RANGE / 2, RANGE / 2);

    let hue = map(distance, 50, RANGE, 180, 300);
    stars.push(new Star(x, y, z, hue));
  }
}

/**
 * 星クラス
 */
class Star {
  constructor(x, y, z, hue) {
    this.x = x;
    this.y = y;
    this.z = z;
    this.hue = hue;
  }
}

/**
 * 描画関数：Galaxy Visual
 */
function drawGalaxyVisual() {
  
  orbitControl();

  // === ライティング ===
  //lights();
  //ambientLight(255);                           // 全体を柔らかく照らす
  //pointLight(255, 255, 255, 0, 0, 200);        // 中央から光を照射

  // === 中央の鼓動スフィア ===
  let rms = amplitude.getLevel();
  let size = 5 + rms * 200;

  push();
  noStroke();
  //specularMaterial(255);                       // 光沢マテリアル
  //shininess(60);
  fill(255);
  sphere(size);
  pop();

  // === 星々 ===
  rotateY(frameCount * 0.002);
  noStroke();
  for (let i = 0; i < stars.length; i++) {
    let p = stars[i];
    push();
    translate(p.x, p.y, p.z);
    // HSB → RGB に変換して emissiveMaterial に渡す
    //let col = HSBtoRGB(p.hue, 100, 100);
    //emissiveMaterial(col.r, col.g, col.b);
    fill(p.hue, 100, 100);
    sphere(2);
    pop();
  }
}

// --- HSB to RGB 安全変換関数 ---
function HSBtoRGB(h, s, b) {
  colorMode(HSB, 360, 100, 100);
  let c = color(h % 360, s, b);
  colorMode(RGB, 255); // 戻す
  return {
    r: red(c),
    g: green(c),
    b: blue(c)
  }
}
