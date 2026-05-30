(function () {
  var players = Array.prototype.slice.call(document.querySelectorAll('[data-player]'));

  players.forEach(function (player) {
    var video = player.querySelector('video');
    var cover = player.querySelector('[data-cover]');
    var button = player.querySelector('[data-play-button]');
    var source = video ? video.getAttribute('data-play') : '';
    var loaded = false;
    var hls = null;

    function loadVideo() {
      if (!video || !source || loaded) {
        return;
      }

      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = source;
      } else if (window.Hls && window.Hls.isSupported()) {
        hls = new window.Hls();
        hls.loadSource(source);
        hls.attachMedia(video);
      } else {
        video.src = source;
      }

      loaded = true;
    }

    function startVideo() {
      loadVideo();
      if (!video) {
        return;
      }
      player.classList.add('is-playing');
      video.setAttribute('controls', 'controls');
      var attempt = video.play();
      if (attempt && typeof attempt.catch === 'function') {
        attempt.catch(function () {});
      }
    }

    if (cover) {
      cover.addEventListener('click', startVideo);
    }
    if (button) {
      button.addEventListener('click', startVideo);
    }
    if (video) {
      video.addEventListener('click', function () {
        if (!loaded) {
          startVideo();
        }
      });
      video.addEventListener('ended', function () {
        player.classList.remove('is-playing');
      });
    }

    window.addEventListener('pagehide', function () {
      if (hls && typeof hls.destroy === 'function') {
        hls.destroy();
      }
    });
  });
})();
