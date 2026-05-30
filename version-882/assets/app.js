(function () {
    function qs(selector, root) {
        return (root || document).querySelector(selector);
    }

    function qsa(selector, root) {
        return Array.prototype.slice.call((root || document).querySelectorAll(selector));
    }

    function ready(callback) {
        if (document.readyState !== "loading") {
            callback();
        } else {
            document.addEventListener("DOMContentLoaded", callback);
        }
    }

    function getQuery(name) {
        var params = new URLSearchParams(window.location.search);
        return params.get(name) || "";
    }

    ready(function () {
        var mobileToggle = qs("[data-mobile-toggle]");
        var mobilePanel = qs("[data-mobile-panel]");
        if (mobileToggle && mobilePanel) {
            mobileToggle.addEventListener("click", function () {
                mobilePanel.classList.toggle("is-open");
            });
        }

        qsa("[data-hero-slider]").forEach(function (slider) {
            var slides = qsa("[data-hero-slide]", slider);
            var dots = qsa("[data-hero-dot]", slider);
            var current = 0;
            var timer;

            function show(index) {
                if (!slides.length) {
                    return;
                }
                current = (index + slides.length) % slides.length;
                slides.forEach(function (slide, i) {
                    slide.classList.toggle("is-active", i === current);
                });
                dots.forEach(function (dot, i) {
                    dot.classList.toggle("is-active", i === current);
                });
            }

            function start() {
                stop();
                timer = window.setInterval(function () {
                    show(current + 1);
                }, 5600);
            }

            function stop() {
                if (timer) {
                    window.clearInterval(timer);
                }
            }

            dots.forEach(function (dot, i) {
                dot.addEventListener("click", function () {
                    show(i);
                    start();
                });
            });

            slider.addEventListener("mouseenter", stop);
            slider.addEventListener("mouseleave", start);
            show(0);
            start();
        });

        qsa("[data-filter-input]").forEach(function (input) {
            var targetSelector = input.getAttribute("data-filter-input");
            var cards = qsa(targetSelector || "[data-search-card]");
            var empty = qs("[data-empty-state]");
            var initial = getQuery("q");
            if (initial) {
                input.value = initial;
            }

            function applyFilter() {
                var value = input.value.trim().toLowerCase();
                var visible = 0;
                cards.forEach(function (card) {
                    var haystack = (card.getAttribute("data-title") + " " + card.getAttribute("data-text")).toLowerCase();
                    var matched = !value || haystack.indexOf(value) !== -1;
                    card.style.display = matched ? "" : "none";
                    if (matched) {
                        visible += 1;
                    }
                });
                if (empty) {
                    empty.classList.toggle("is-visible", visible === 0);
                }
            }

            input.addEventListener("input", applyFilter);
            applyFilter();
        });

        qsa("[data-video-player]").forEach(function (shell) {
            var video = qs("video", shell);
            var button = qs("[data-play-button]", shell);
            var source = shell.getAttribute("data-src");
            var initialized = false;
            var hlsInstance = null;

            function initialize() {
                if (initialized || !video || !source) {
                    return;
                }
                initialized = true;
                if (video.canPlayType("application/vnd.apple.mpegurl")) {
                    video.src = source;
                } else if (window.Hls && window.Hls.isSupported()) {
                    hlsInstance = new window.Hls({
                        enableWorker: true,
                        lowLatencyMode: true
                    });
                    hlsInstance.loadSource(source);
                    hlsInstance.attachMedia(video);
                } else {
                    video.src = source;
                }
            }

            function playVideo(event) {
                if (event) {
                    event.preventDefault();
                }
                initialize();
                shell.classList.add("is-playing");
                var promise = video.play();
                if (promise && promise.catch) {
                    promise.catch(function () {
                        shell.classList.remove("is-playing");
                    });
                }
            }

            shell.addEventListener("click", function (event) {
                if (event.target === video && !video.paused) {
                    return;
                }
                playVideo(event);
            });
            if (button) {
                button.addEventListener("click", playVideo);
            }
            video.addEventListener("play", function () {
                shell.classList.add("is-playing");
            });
            video.addEventListener("pause", function () {
                shell.classList.remove("is-playing");
            });
            video.addEventListener("ended", function () {
                shell.classList.remove("is-playing");
                if (hlsInstance && video) {
                    video.currentTime = 0;
                }
            });
        });
    });
})();
