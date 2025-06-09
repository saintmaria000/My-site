// UI の初期化とデバッグ表示
let infoDiv;

function setupUI() {
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
  const visualSelector = select('#visual-selector');
  visualSelector.changed(() => {
    const val = parseInt(visualSelector.value());
    switchVisual(val);
  });
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
