(function() {
    function ready(fn) {
        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", fn);
        } else {
            fn();
        }
    }

    ready(function() {
        var menuButton = document.querySelector(".mobile-menu-button");
        var mobileNav = document.querySelector(".mobile-nav");
        if (menuButton && mobileNav) {
            menuButton.addEventListener("click", function() {
                var open = mobileNav.classList.toggle("is-open");
                menuButton.setAttribute("aria-expanded", String(open));
            });
        }

        initHero();
        initFilters();
    });

    function initHero() {
        var slides = Array.prototype.slice.call(document.querySelectorAll("[data-hero-slide]"));
        if (!slides.length) {
            return;
        }
        var dots = Array.prototype.slice.call(document.querySelectorAll("[data-hero-dot]"));
        var prev = document.querySelector("[data-hero-prev]");
        var next = document.querySelector("[data-hero-next]");
        var current = 0;
        var timer = null;

        function show(index) {
            current = (index + slides.length) % slides.length;
            slides.forEach(function(slide, slideIndex) {
                slide.classList.toggle("is-active", slideIndex === current);
            });
            dots.forEach(function(dot, dotIndex) {
                dot.classList.toggle("is-active", dotIndex === current);
            });
        }

        function start() {
            stop();
            timer = window.setInterval(function() {
                show(current + 1);
            }, 5200);
        }

        function stop() {
            if (timer) {
                window.clearInterval(timer);
            }
        }

        if (prev) {
            prev.addEventListener("click", function() {
                show(current - 1);
                start();
            });
        }
        if (next) {
            next.addEventListener("click", function() {
                show(current + 1);
                start();
            });
        }
        dots.forEach(function(dot, dotIndex) {
            dot.addEventListener("click", function() {
                show(dotIndex);
                start();
            });
        });
        start();
    }

    function initFilters() {
        var scopes = Array.prototype.slice.call(document.querySelectorAll("[data-filter-scope]"));
        scopes.forEach(function(scope) {
            var input = scope.querySelector("[data-filter-input]");
            var yearSelect = scope.querySelector("[data-year-select]");
            var categorySelect = scope.querySelector("[data-category-select]");
            var container = document.querySelector("[data-card-list]");
            var empty = document.querySelector("[data-empty-state]");
            if (!container) {
                return;
            }
            var cards = Array.prototype.slice.call(container.querySelectorAll(".movie-card"));

            function applyFilter() {
                var query = input ? input.value.trim().toLowerCase() : "";
                var year = yearSelect ? yearSelect.value : "";
                var category = categorySelect ? categorySelect.value : "";
                var visible = 0;
                cards.forEach(function(card) {
                    var text = card.getAttribute("data-search") || "";
                    var cardYear = card.getAttribute("data-year") || "";
                    var cardCategory = card.getAttribute("data-category") || "";
                    var matched = true;
                    if (query && text.indexOf(query) === -1) {
                        matched = false;
                    }
                    if (year && cardYear !== year) {
                        matched = false;
                    }
                    if (category && cardCategory !== category) {
                        matched = false;
                    }
                    card.hidden = !matched;
                    if (matched) {
                        visible += 1;
                    }
                });
                if (empty) {
                    empty.hidden = visible !== 0;
                }
            }

            if (input) {
                var params = new URLSearchParams(window.location.search);
                var initialQuery = params.get("q");
                if (initialQuery) {
                    input.value = initialQuery;
                }
                input.addEventListener("input", applyFilter);
            }
            if (yearSelect) {
                yearSelect.addEventListener("change", applyFilter);
            }
            if (categorySelect) {
                categorySelect.addEventListener("change", applyFilter);
            }
            applyFilter();
        });
    }
})();

function initializePlayer(streamUrl) {
    var shell = document.querySelector("[data-player]");
    if (!shell) {
        return;
    }
    var video = shell.querySelector("video");
    var cover = shell.querySelector(".player-cover");
    var button = shell.querySelector(".player-play-button");
    var message = shell.querySelector(".player-message");
    var loaded = false;
    var hls = null;

    function setMessage(text) {
        if (!message) {
            return;
        }
        if (text) {
            message.textContent = text;
            message.hidden = false;
        } else {
            message.textContent = "";
            message.hidden = true;
        }
    }

    function loadVideo() {
        if (loaded || !video) {
            return;
        }
        loaded = true;
        if (window.Hls && window.Hls.isSupported()) {
            hls = new window.Hls({
                enableWorker: true
            });
            hls.loadSource(streamUrl);
            hls.attachMedia(video);
            hls.on(window.Hls.Events.ERROR, function(event, data) {
                if (!data || !data.fatal) {
                    return;
                }
                if (data.type === window.Hls.ErrorTypes.NETWORK_ERROR) {
                    hls.startLoad();
                } else if (data.type === window.Hls.ErrorTypes.MEDIA_ERROR) {
                    hls.recoverMediaError();
                } else {
                    setMessage("播放暂时不可用，请稍后再试。");
                    hls.destroy();
                }
            });
        } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
            video.src = streamUrl;
        } else {
            setMessage("播放暂时不可用，请稍后再试。");
        }
    }

    function startPlayback() {
        loadVideo();
        if (cover) {
            cover.classList.add("is-hidden");
        }
        if (video) {
            var playPromise = video.play();
            if (playPromise && typeof playPromise.catch === "function") {
                playPromise.catch(function() {
                    setMessage("点击视频区域继续播放。");
                });
            }
        }
    }

    if (button) {
        button.addEventListener("click", function(event) {
            event.stopPropagation();
            startPlayback();
        });
    }
    if (cover) {
        cover.addEventListener("click", startPlayback);
    }
    if (video) {
        video.addEventListener("click", function() {
            if (video.paused) {
                startPlayback();
            }
        });
    }
    window.addEventListener("beforeunload", function() {
        if (hls) {
            hls.destroy();
        }
    });
}
