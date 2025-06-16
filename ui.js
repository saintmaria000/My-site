// UI の初期化とデバッグ表示
let infoDiv;

function setupUI() {
  // 再生トグルボタンの設定（audio.js にある togglePlay を使う）
  const toggleBtn = select('#toggle-btn');
  if (toggleBtn) {
    toggleBtn.mousePressed(togglePlay);
  }

  // デバッグ情報表示用の infoDiv を作成・スタイル設定
  infoDiv = createDiv('');
  infoDiv.style('position', 'fixed')
         .style('top', '50%')
         .style('right', '20px')
         .style('transform', 'translateY(-50%)')
         .style('color', '#0f0')
         .style('font-family', 'monospace')
         .style('font-size', '14px')
         .style('background', 'rgba(0, 0, 0, 0.5)')
         .style('padding', '10px')
         .style('border-radius', '6px')
         .style('z-index', '10');
}

function updateDebugInfo(data) {
  infoDiv.html(`
    waveform.length: ${data.waveformLength}<br/>
    isPlaying: ${data.isPlaying}<br/>
    volume: ${data.volume}<br/>
    bass: ${data.bass}<br/>
    mid: ${data.mid}<br/>
    hi: ${data.hi}<br/>
  `);
}
