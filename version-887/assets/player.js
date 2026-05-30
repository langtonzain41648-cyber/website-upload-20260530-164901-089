(function () {
    var hlsPromise = null;
    var scriptUrl = document.currentScript ? document.currentScript.src : "";
    var hlsUrl = scriptUrl ? new URL("hls-dru42stk.js", scriptUrl).href : "./assets/hls-dru42stk.js";

    function loadGlobalHls() {
        return new Promise(function (resolve, reject) {
            if (window.Hls) {
                resolve(window.Hls);
                return;
            }
            var node = document.createElement("script");
            node.src = "https://cdn.jsdelivr.net/npm/hls.js@1.5.17/dist/hls.min.js";
            node.async = true;
            node.onload = function () {
                resolve(window.Hls || null);
            };
            node.onerror = function () {
                reject(new Error("load failed"));
            };
            document.head.appendChild(node);
        });
    }

    function getHls() {
        if (!hlsPromise) {
            hlsPromise = import(hlsUrl)
                .then(function (mod) {
                    return mod.H || window.Hls || null;
                })
                .catch(function () {
                    return loadGlobalHls();
                });
        }
        return hlsPromise;
    }

    window.initMoviePlayer = function (sourceUrl, playerId) {
        var root = document.getElementById(playerId);
        if (!root) {
            return;
        }
        var video = root.querySelector("video");
        var layer = root.querySelector(".play-layer");
        var prepared = false;
        var preparing = false;
        var hlsInstance = null;

        function setLayer(hidden) {
            if (layer) {
                layer.classList.toggle("is-hidden", hidden);
            }
        }

        function prepare() {
            if (prepared) {
                return Promise.resolve();
            }
            if (preparing) {
                return new Promise(function (resolve) {
                    var timer = setInterval(function () {
                        if (prepared) {
                            clearInterval(timer);
                            resolve();
                        }
                    }, 80);
                });
            }
            preparing = true;
            if (video.canPlayType("application/vnd.apple.mpegurl")) {
                video.src = sourceUrl;
                prepared = true;
                preparing = false;
                return Promise.resolve();
            }
            return getHls()
                .then(function (Hls) {
                    if (Hls && Hls.isSupported()) {
                        hlsInstance = new Hls({
                            enableWorker: true,
                            lowLatencyMode: true,
                            backBufferLength: 90
                        });
                        hlsInstance.loadSource(sourceUrl);
                        hlsInstance.attachMedia(video);
                        prepared = true;
                        preparing = false;
                        return;
                    }
                    video.src = sourceUrl;
                    prepared = true;
                    preparing = false;
                })
                .catch(function () {
                    video.src = sourceUrl;
                    prepared = true;
                    preparing = false;
                });
        }

        function play() {
            prepare().then(function () {
                setLayer(true);
                var request = video.play();
                if (request && typeof request.catch === "function") {
                    request.catch(function () {
                        setLayer(false);
                    });
                }
            });
        }

        if (layer) {
            layer.addEventListener("click", play);
        }
        video.addEventListener("click", function () {
            if (video.paused) {
                play();
            } else {
                video.pause();
                setLayer(false);
            }
        });
        video.addEventListener("play", function () {
            setLayer(true);
        });
        video.addEventListener("pause", function () {
            setLayer(false);
        });
        video.addEventListener("ended", function () {
            setLayer(false);
        });
        window.addEventListener("beforeunload", function () {
            if (hlsInstance && typeof hlsInstance.destroy === "function") {
                hlsInstance.destroy();
            }
        });
    };
})();
