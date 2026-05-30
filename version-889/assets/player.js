(function () {
  var configNode = document.getElementById('player-config');
  var video = document.querySelector('.movie-player');
  var shell = document.querySelector('.player-shell');
  var trigger = document.querySelector('.play-overlay');
  if (!configNode || !video || !shell || !trigger) {
    return;
  }

  var config = {};
  try {
    config = JSON.parse(configNode.textContent || '{}');
  } catch (error) {
    config = {};
  }

  var streamUrl = config.source || '';
  var hlsInstance = null;
  var attached = false;

  var attach = function () {
    if (!streamUrl || attached) {
      return;
    }
    attached = true;
    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = streamUrl;
      return;
    }
    if (window.Hls && window.Hls.isSupported()) {
      hlsInstance = new window.Hls({
        enableWorker: true,
        lowLatencyMode: true
      });
      hlsInstance.loadSource(streamUrl);
      hlsInstance.attachMedia(video);
      return;
    }
    video.src = streamUrl;
  };

  var play = function () {
    attach();
    video.controls = true;
    shell.classList.add('is-playing');
    var result = video.play();
    if (result && typeof result.catch === 'function') {
      result.catch(function () {});
    }
  };

  trigger.addEventListener('click', play);
  video.addEventListener('click', function () {
    if (video.paused) {
      play();
    } else {
      video.pause();
    }
  });
  video.addEventListener('play', function () {
    shell.classList.add('is-playing');
  });
  video.addEventListener('pause', function () {
    shell.classList.remove('is-playing');
  });
  window.addEventListener('pagehide', function () {
    if (hlsInstance) {
      hlsInstance.destroy();
    }
  });
})();
