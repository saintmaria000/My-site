let sound;
let fft;
let button;

function setup() {
  createCanvas(windowWidth, windowHeight);
  fft = new p5.FFT();

  volumeSlider = select("#volume-slider");

  // ファイル選択で音楽ロード
  document.getElementById("file-input").addEventListener("change", (e) => {
    if (sound) {
      sound.stop();
    }
    const file = e.target.files[0];
    if (file) {
      sound = loadSound(URL.createObjectURL(file), () => {
        console.log("Sound loaded");
      });
    }
  });
  
   reverb = new p5.Reverb();
  sound.disconnect();              // メイン出力から切り離す
  reverb.process(sound, 3, 2);
  
  // ボタンクリックイベントの設定
  button = select('#toggle-btn');
  button.mousePressed(togglePlay);
  
  noFill();
  stroke(255);
  strokeWeight(2);
}

function draw() {
    background(0, 20); // 残像効果（トレイル演出）
  
    let waveform = fft.waveform();
  
    beginShape();
    for (let i = 0; i < waveform.length; i++) {
      let x = map(i, 0, waveform.length, 0, width);
      let y = map(waveform[i], -1, 1, 0, height);
      vertex(x, y);
    }
    endShape();
  }
function togglePlay() {
   if (sound.isPlaying()) {
    // フェードアウト → 完全停止
    sound.setVolume(0, 1); // 1秒かけて音量0へ
    setTimeout(() => {
      sound.stop();
      sound.setVolume(1); // 次回再生のために戻す
    }, 1000);
  } else {
    sound.setVolume(0); // 再生直後は音量0
    sound.play();
    sound.setVolume(1, 1); // 1秒かけて音量1に（フェードイン）
   }
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}

/*let sound;
let fft;
let button;
let particles = [];

function preload() {
  sound = loadSound('music/Synonmy.mp3');
}

function setup() {
  createCanvas(windowWidth, windowHeight);
  amp = new p5.Amplitude();
  sound.play();
}

function draw() {
  background(0, 50);

  let level = amp.getLevel();
  let numNew = int(map(level, 0, 0.3, 0, 5)); // 音が大きいと粒子が増える

  for (let i = 0; i < numNew; i++) {
    particles.push(new Particle());
  }

  for (let i = particles.length - 1; i >= 0; i--) {
    particles[i].update();
    particles[i].display();

    if (particles[i].isDead()) {
      particles.splice(i, 1);
    }
  }
}

// パーティクルクラス
class Particle {
  constructor() {
    this.pos = createVector(width / 2, height / 2);
    this.vel = p5.Vector.random2D().mult(random(1, 4));
    this.life = 255;
  }

  update() {
    this.pos.add(this.vel);
    this.life -= 2;
  }

  display() {
    noStroke();
    fill(255, this.life);
    ellipse(this.pos.x, this.pos.y, 5);
  }

  isDead() {
    return this.life <= 0;
  }
}*/
