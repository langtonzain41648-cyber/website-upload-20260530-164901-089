(function () {
    function ready(fn) {
        if (document.readyState !== "loading") {
            fn();
        } else {
            document.addEventListener("DOMContentLoaded", fn);
        }
    }

    ready(function () {
        var toggle = document.querySelector(".menu-toggle");
        var panel = document.querySelector(".mobile-panel");
        if (toggle && panel) {
            toggle.addEventListener("click", function () {
                var open = panel.hasAttribute("hidden");
                if (open) {
                    panel.removeAttribute("hidden");
                } else {
                    panel.setAttribute("hidden", "");
                }
                toggle.setAttribute("aria-expanded", open ? "true" : "false");
            });
        }

        var slides = Array.prototype.slice.call(document.querySelectorAll(".hero-slide"));
        var dots = Array.prototype.slice.call(document.querySelectorAll(".hero-dot"));
        var index = 0;
        function showSlide(next) {
            if (!slides.length) {
                return;
            }
            index = (next + slides.length) % slides.length;
            slides.forEach(function (slide, i) {
                slide.classList.toggle("active", i === index);
            });
            dots.forEach(function (dot, i) {
                dot.classList.toggle("active", i === index);
            });
        }
        dots.forEach(function (dot) {
            dot.addEventListener("click", function () {
                showSlide(Number(dot.getAttribute("data-target") || 0));
            });
        });
        if (slides.length > 1) {
            setInterval(function () {
                showSlide(index + 1);
            }, 5600);
        }

        var sortSelect = document.querySelector(".sort-select");
        var sortableGrid = document.querySelector(".sortable-grid");
        if (sortSelect && sortableGrid) {
            sortSelect.addEventListener("change", function () {
                var cards = Array.prototype.slice.call(sortableGrid.querySelectorAll(".movie-card"));
                var mode = sortSelect.value;
                cards.sort(function (a, b) {
                    if (mode === "year-desc") {
                        return Number(b.getAttribute("data-year")) - Number(a.getAttribute("data-year"));
                    }
                    if (mode === "year-asc") {
                        return Number(a.getAttribute("data-year")) - Number(b.getAttribute("data-year"));
                    }
                    if (mode === "title") {
                        return (a.textContent || "").localeCompare(b.textContent || "", "zh-Hans-CN");
                    }
                    return 0;
                });
                cards.forEach(function (card) {
                    sortableGrid.appendChild(card);
                });
            });
        }

        var params = new URLSearchParams(window.location.search);
        var q = params.get("q") || "";
        var searchInput = document.querySelector(".search-page-input");
        var searchGrid = document.querySelector(".search-grid");
        var searchStatus = document.querySelector(".search-status");
        var chips = Array.prototype.slice.call(document.querySelectorAll(".search-chip"));
        var query = q.trim();
        if (searchInput) {
            searchInput.value = query;
        }
        function applySearch(nextQuery) {
            if (!searchGrid) {
                return;
            }
            query = (nextQuery || "").trim();
            var normalized = query.toLowerCase();
            var cards = Array.prototype.slice.call(searchGrid.querySelectorAll(".movie-card"));
            var visible = 0;
            cards.forEach(function (card) {
                var keywords = (card.getAttribute("data-keywords") || "").toLowerCase();
                var matched = !normalized || keywords.indexOf(normalized) !== -1;
                card.hidden = !matched;
                if (matched) {
                    visible += 1;
                }
            });
            if (searchStatus) {
                searchStatus.textContent = normalized ? "已筛选相关影片" : "相关影片";
            }
        }
        applySearch(query);
        chips.forEach(function (chip) {
            chip.addEventListener("click", function () {
                chips.forEach(function (item) {
                    item.classList.remove("active");
                });
                chip.classList.add("active");
                var value = chip.getAttribute("data-filter") || "";
                if (searchInput) {
                    searchInput.value = value;
                }
                applySearch(value);
            });
        });
        if (searchInput && searchGrid) {
            searchInput.addEventListener("input", function () {
                applySearch(searchInput.value);
            });
        }
    });
})();
