(function () {
  function initPlayer(root) {
    var video = root.querySelector("video");
    var button = root.querySelector(".player-start");
    var status = root.querySelector(".player-status");
    var source = root.dataset.src;
    var hls = null;
    var initialized = false;

    function setStatus(message) {
      if (status) {
        status.textContent = message;
      }
    }

    function playVideo() {
      var playPromise = video.play();
      if (playPromise && typeof playPromise.catch === "function") {
        playPromise.catch(function () {
          setStatus("浏览器阻止了自动播放，请再次点击播放按钮。");
        });
      }
    }

    function start() {
      if (!source) {
        setStatus("当前条目缺少播放源。");
        return;
      }
      root.classList.add("playing");
      setStatus("正在加载播放源...");

      if (initialized) {
        playVideo();
        return;
      }
      initialized = true;

      if (window.Hls && window.Hls.isSupported()) {
        hls = new window.Hls({
          maxBufferLength: 30,
          enableWorker: true
        });
        hls.loadSource(source);
        hls.attachMedia(video);
        hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
          setStatus("播放源已就绪。");
          playVideo();
        });
        hls.on(window.Hls.Events.ERROR, function (eventName, data) {
          if (data && data.fatal) {
            setStatus("播放源加载失败，请刷新页面或更换浏览器尝试。");
          }
        });
      } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = source;
        video.addEventListener("loadedmetadata", function () {
          setStatus("播放源已就绪。");
          playVideo();
        }, { once: true });
      } else {
        setStatus("当前浏览器需要支持 HLS 或成功加载 hls.js 才能播放。");
      }
    }

    if (button) {
      button.addEventListener("click", start);
    }
    video.addEventListener("play", function () {
      root.classList.add("playing");
    });
    video.addEventListener("pause", function () {
      if (!video.currentTime) {
        root.classList.remove("playing");
      }
    });
    window.addEventListener("beforeunload", function () {
      if (hls) {
        hls.destroy();
      }
    });
  }

  document.addEventListener("DOMContentLoaded", function () {
    Array.prototype.slice.call(document.querySelectorAll(".site-player")).forEach(initPlayer);
  });
})();
