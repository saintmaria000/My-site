// === 銀河ビジュアル＋キックによる放射エフェクト ===

let stars = [];          // 星オブジェクトの配列
let pulses = [];         // 放射エフェクトの配列
let limStars = 990;      // 星の数
let RANGE = 1200;        // 銀河の広がり範囲

// === 星の初期化（銀河腕構造に沿って配置） ===
function initvisual2() {
  let arms = 7;          // 銀河の腕の数
  let spread = 4;        // 星のばらつき（ノイズ）
  stars = [];

  for (let i = 0; i < limStars; i++) {
    let arm = i % arms;  // 腕の番号
    let distance = random(50, RANGE);
    let angle = arm / arms * TWO_PI + distance * 0.02;
    angle += sin(distance * 0.1 + frameCount * 0.01) * 0.3; // うねり

    let x = distance * cos(angle) + randomGaussian() * distance * spread;
    let y = distance * sin(angle) + randomGaussian() * distance * spread;
    let z = random(-RANGE / 1.2, RANGE / 1.2);

    let hue = map(distance, 50, RANGE, 180, 300); // 外側ほど青
    stars.push(new Star(x, y, z, hue));
  }
}

// === 星クラス ===
class Star {
  constructor(x, y, z, hue) {
    this.x = x;
    this.y = y;
    this.z = z;
    this.hue = hue;
    this.size = random(1, 3.5);       // 星のサイズ
    this.alpha = 0;                   // 透明度（フェード）
    this.fadeSpeed = random(0.5, 1.2);
    this.state = 'fadeIn';            // 状態：フェードイン中かアウト中か
  }

  // 星のフェード更新（輝き）
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
        this.reposition(); // フェードアウト後に再配置
      }
    }
  }

  // 星を銀河腕に再配置
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

  // 星を描画
  draw() {
    push();
    translate(this.x, this.y, this.z);
    colorMode(HSB, 360, 100, 100, 100);
    fill(this.hue, 80, 100, this.alpha); // HSB色で透明度付き
    noStroke();
    sphere(this.size); // 立体球で描画
    pop();
  }
}

// === 描画関数：Galaxy Visual ===
function drawvisual2() {
  orbitControl();      // マウスで3D操作可能に

  detectKick();        // キック音検出
  updatePulses();      // 放射波紋の状態更新
  drawPulses();        // 放射波紋の描画

  let rms = amplitude.getLevel();       // 音量取得（Amplitude）
  let centerSize = 4 + rms * 100;       // 音量でスフィアサイズ変動

  // 中央スフィアを描画（鼓動）
  push();
  noStroke();
  fill(255);
  sphere(centerSize);
  pop();

  // 星の更新・描画
  rotateY(frameCount * 0.002); // 回転で銀河風
  for (let s of stars) {
    s.update();
    s.draw();
  }
}

// === キック検出（低音20〜60Hz） ===
function detectKick() {
  let lowEnergy = fft.getEnergy(20, 60);
  if (lowEnergy > 180) { // 閾値以上なら反応
    pulses.push({
      radius: 0,
      alpha: 80,
      hue: random(180, 240) // 青系で波紋色（自由に変更可）
    });
  }
}

// === パルスの拡大・減衰処理 ===
function updatePulses() {
  for (let i = pulses.length - 1; i >= 0; i--) {
    let p = pulses[i];
    p.radius += 20;   // 広がる
    p.alpha -= 3;     // 薄くなる
    if (p.alpha <= 0) {
      pulses.splice(i, 1); // 完全に消えたら削除
    }
  }
}

// === パルスの描画（画面中心から放射状に拡がる円） ===
function drawPulses() {
  noFill();
  for (let p of pulses) {
    strokeWeight(4);
    colorMode(HSB, 360, 100, 100, 100);
    stroke(p.hue, 80, 100, p.alpha);
    ellipse(0, 0, p.radius, p.radius); // 中心から円で描画
  }
}
