function initMoviePlayer(streamUrl) {
    var video = document.getElementById('movie-player');
    var mask = document.querySelector('.play-mask');
    var hlsInstance = null;
    var loaded = false;

    if (!video || !mask || !streamUrl) {
        return;
    }

    function loadStream() {
        if (loaded) {
            return Promise.resolve();
        }

        loaded = true;

        if (video.canPlayType('application/vnd.apple.mpegurl')) {
            video.src = streamUrl;
            return Promise.resolve();
        }

        if (window.Hls && window.Hls.isSupported()) {
            hlsInstance = new Hls({
                enableWorker: true,
                lowLatencyMode: true,
                backBufferLength: 90
            });
            hlsInstance.loadSource(streamUrl);
            hlsInstance.attachMedia(video);
            return new Promise(function (resolve) {
                hlsInstance.on(Hls.Events.MANIFEST_PARSED, function () {
                    resolve();
                });
            });
        }

        video.src = streamUrl;
        return Promise.resolve();
    }

    function startPlayback() {
        mask.classList.add('is-hidden');
        loadStream().then(function () {
            var playTask = video.play();
            if (playTask && typeof playTask.catch === 'function') {
                playTask.catch(function () {
                    mask.classList.remove('is-hidden');
                });
            }
        });
    }

    mask.addEventListener('click', startPlayback);

    video.addEventListener('play', function () {
        mask.classList.add('is-hidden');
    });

    video.addEventListener('ended', function () {
        mask.classList.remove('is-hidden');
    });

    video.addEventListener('error', function () {
        mask.classList.remove('is-hidden');
    });

    window.addEventListener('beforeunload', function () {
        if (hlsInstance) {
            hlsInstance.destroy();
        }
    });
}
