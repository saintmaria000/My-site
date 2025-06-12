// === Galaxy Visual ===
// 星々が腕に沿って広がり、中央スフィアが鼓動。星はフェードイン・アウトで瞬く。

let stars = [];
let limStars = 990;
let RANGE = 1200;

/**
 * 初期化：銀河風に星を配置
 */
function initGalaxyStars() {
  let arms = 7;
  let spread = 4;
  stars = [];

  for (let i = 0; i < limStars; i++) {
    let arm = i % arms;
    let distance = random(50, RANGE);
    let angle = arm / arms * TWO_PI + distance * 0.02;
    angle += sin(distance * 0.1 + frameCount * 0.01) * 0.3;

    let x = distance * cos(angle) + randomGaussian() * distance * spread;
    let y = distance * sin(angle) + randomGaussian() * distance * spread;
    let z = random(-RANGE / 1.2, RANGE / 1.2);

    let hue = map(distance, 50, RANGE, 180, 300);
    stars.push(new Star(x, y, z, hue));
  }
}

/**
 * 星クラス：位置・色・サイズ・アルファ・状態を保持し更新
 */
class Star {
  constructor(x, y, z, hue) {
    this.x = x;
    this.y = y;
    this.z = z;
    this.hue = hue;
    this.size = random(1, 3.5);

    this.alpha = 0;
    this.fadeSpeed = random(0.5, 1.2);
    this.state = 'fadeIn';
  }

  update() {
    if (this.state === 'fadeIn') {
      this.alpha += this.fadeSpeed;
      if (this.alpha >= 100) {
        this.alpha = 100;
        this.state = 'fadeOut';
      }
    } else {
      this.alpha -= this.fadeSpeed;
      if (this.alpha <= 0) {
        this.alpha = 0;
        this.state = 'fadeIn';
        this.reposition(); // 消えたら再生成
      }
    }
  }

  reposition() {
    let arms = 7;
    let spread = 4;
    let distance = random(50, RANGE);
    let arm = floor(random(arms));
    let angle = arm / arms * TWO_PI + distance * 0.02;
    angle += sin(distance * 0.1 + frameCount * 0.01) * 0.3;

    this.x = distance * cos(angle) + randomGaussian() * distance * spread;
    this.y = distance * sin(angle) + randomGaussian() * distance * spread;
    this.z = random(-RANGE / 1.2, RANGE / 1.2);
    this.hue = map(distance, 50, RANGE, 180, 300);
  }

  draw() {
    push();
    translate(this.x, this.y, this.z);
    colorMode(HSB, 360, 100, 100, 100);
    fill(this.hue, 80, 100, this.alpha);
    noStroke();
    sphere(this.size);
    pop();
  }
}

/**
 * 描画関数：Galaxy Visual
 */
function drawGalaxyVisual() {
  orbitControl();

  // 中央のスフィア
  let rms = amplitude.getLevel();
  let centerSize = 4 + rms * 100;

  push();
  noStroke();
  fill(255);
  sphere(centerSize);
  pop();

  // 星たちを更新・描画
  rotateY(frameCount * 0.002);
  for (let i = 0; i < stars.length; i++) {
    stars[i].update();
    stars[i].draw();
  }
}
