(function () {
  function ready(fn) {
    if (document.readyState === "complete") {
      fn();
    } else {
      document.addEventListener("DOMContentLoaded", fn, { once: true });
    }
  }

  function attach(video, stream) {
    if (!video || !stream) {
      return null;
    }
    if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = stream;
      return null;
    }
    if (window.Hls && window.Hls.isSupported()) {
      var hls = new window.Hls({
        enableWorker: true,
        lowLatencyMode: true
      });
      hls.loadSource(stream);
      hls.attachMedia(video);
      return hls;
    }
    video.src = stream;
    return null;
  }

  function startPlayer(shell) {
    var video = shell.querySelector("video");
    var button = shell.querySelector(".play-overlay");
    var stream = video ? video.getAttribute("data-stream") : "";
    var loaded = false;
    var instance = null;

    function play() {
      if (!loaded) {
        instance = attach(video, stream);
        loaded = true;
      }
      if (button) {
        button.classList.add("is-hidden");
      }
      var action = video.play();
      if (action && typeof action.catch === "function") {
        action.catch(function () {
          if (button) {
            button.classList.remove("is-hidden");
          }
        });
      }
    }

    if (button) {
      button.addEventListener("click", play);
    }
    if (video) {
      video.addEventListener("click", function () {
        if (video.paused) {
          play();
        }
      });
      video.addEventListener("play", function () {
        if (button) {
          button.classList.add("is-hidden");
        }
      });
      video.addEventListener("error", function () {
        if (button) {
          button.classList.remove("is-hidden");
        }
      });
    }
    return instance;
  }

  ready(function () {
    document.querySelectorAll(".player-shell").forEach(startPlayer);
  });
})();
