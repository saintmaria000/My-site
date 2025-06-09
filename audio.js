let sound, fft, amplitude;

/**
 * サウンドとFFT初期化、UIイベントも設定
 */
function setupAudio() {
  // FFT・Amplitude の初期化
  fft = new p5.FFT();
  amplitude = new p5.Amplitude();

  // DOMが完全に読み込まれてから実行
  window.addEventListener('DOMContentLoaded', () => {
    const fileInput = document.getElementById('file-input');
    const fileNameDisplay = document.getElementById('file-name-display');
    const toggleBtn = document.getElementById('toggle-btn');

    if (!fileInput || !toggleBtn) {
      console.error("UI要素が見つかりません");
      return;
    }

    // ファイル選択時の処理
    fileInput.addEventListener('change', (event) => {
      const file = event.target.files[0];
      if (!file) return;

      if (sound && sound.isPlaying()) {
        sound.stop();
      }

      sound = loadSound(URL.createObjectURL(file), () => {
        console.log('音声読み込み完了');
        if (fileNameDisplay) {
          fileNameDisplay.textContent = `🎵 ${file.name}`;
        }
        fft.setInput(sound);
        sound.play();
      });
    });

    // 再生・停止ボタン
    toggleBtn.addEventListener('click', togglePlay);
  });
}

/**
 * 再生・停止を切り替える処理
 */
function togglePlay() {
  getAudioContext().resume().then(() => {
    if (!sound || !sound.isLoaded()) return;

    if (sound.isPlaying()) {
      sound.setVolume(0, 1);
      setTimeout(() => {
        sound.stop();
        sound.setVolume(1);
      }, 1000);
    } else {
      sound.setVolume(0);
      sound.play();
      setTimeout(() => fft.setInput(sound), 100);
      sound.setVolume(1, 1);
    }
  });
}
