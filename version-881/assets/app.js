(function () {
      function bySelector(selector, root) {
        return Array.prototype.slice.call((root || document).querySelectorAll(selector));
      }

      function escapeHtml(value) {
        return String(value || "")
          .replace(/&/g, "&amp;")
          .replace(/</g, "&lt;")
          .replace(/>/g, "&gt;")
          .replace(/"/g, "&quot;")
          .replace(/'/g, "&#039;");
      }

      function initMobileMenu() {
        var toggle = document.querySelector("[data-menu-toggle]");
        var panel = document.querySelector("[data-mobile-panel]");
        if (!toggle || !panel) {
          return;
        }
        toggle.addEventListener("click", function () {
          panel.classList.toggle("open");
        });
      }

      function initHeroSlider() {
        var slider = document.querySelector("[data-hero-slider]");
        if (!slider) {
          return;
        }
        var slides = bySelector(".hero-slide", slider);
        var dots = bySelector(".hero-dot", slider);
        var prev = slider.querySelector("[data-hero-prev]");
        var next = slider.querySelector("[data-hero-next]");
        var index = 0;
        var timer = null;

        function show(nextIndex) {
          index = (nextIndex + slides.length) % slides.length;
          slides.forEach(function (slide, slideIndex) {
            slide.classList.toggle("active", slideIndex === index);
          });
          dots.forEach(function (dot, dotIndex) {
            dot.classList.toggle("active", dotIndex === index);
          });
        }

        function start() {
          stop();
          timer = window.setInterval(function () {
            show(index + 1);
          }, 5200);
        }

        function stop() {
          if (timer) {
            window.clearInterval(timer);
            timer = null;
          }
        }

        dots.forEach(function (dot, dotIndex) {
          dot.addEventListener("click", function () {
            show(dotIndex);
            start();
          });
        });

        if (prev) {
          prev.addEventListener("click", function () {
            show(index - 1);
            start();
          });
        }

        if (next) {
          next.addEventListener("click", function () {
            show(index + 1);
            start();
          });
        }

        slider.addEventListener("mouseenter", stop);
        slider.addEventListener("mouseleave", start);
        show(0);
        start();
      }

      function initFilterGrid() {
        var panel = document.querySelector("[data-filter-panel]");
        var grid = document.querySelector("[data-filter-grid]");
        if (!panel || !grid) {
          return;
        }
        var searchInput = panel.querySelector("[data-filter-search]");
        var yearSelect = panel.querySelector("[data-filter-year]");
        var typeSelect = panel.querySelector("[data-filter-type]");
        var countBox = panel.querySelector("[data-filter-count]");
        var cards = bySelector(".movie-card", grid);

        function matchText(card, keyword) {
          if (!keyword) {
            return true;
          }
          var text = [
            card.dataset.title,
            card.dataset.region,
            card.dataset.type,
            card.dataset.genre,
            card.dataset.tags
          ].join(" ").toLowerCase();
          return text.indexOf(keyword.toLowerCase()) !== -1;
        }

        function applyFilter() {
          var keyword = searchInput ? searchInput.value.trim() : "";
          var year = yearSelect ? yearSelect.value : "";
          var type = typeSelect ? typeSelect.value : "";
          var visible = 0;
          cards.forEach(function (card) {
            var ok = matchText(card, keyword);
            if (year && card.dataset.year !== year) {
              ok = false;
            }
            if (type && card.dataset.type !== type) {
              ok = false;
            }
            card.style.display = ok ? "" : "none";
            if (ok) {
              visible += 1;
            }
          });
          if (countBox) {
            countBox.textContent = "当前显示 " + visible + " 部";
          }
        }

        [searchInput, yearSelect, typeSelect].forEach(function (control) {
          if (control) {
            control.addEventListener("input", applyFilter);
            control.addEventListener("change", applyFilter);
          }
        });
        applyFilter();
      }

      function movieCardTemplate(movie, prefix) {
        var tags = (movie.tags || []).slice(0, 3).map(function (tag) {
          return "<span>" + escapeHtml(tag) + "</span>";
        }).join("");
        return [
          "<article class="movie-card">",
          "  <a class="poster-link" href="" + prefix + "/movies/" + escapeHtml(movie.id) + ".html">",
          "    <img src="" + prefix + "/" + escapeHtml(movie.coverId) + ".jpg" alt="" + escapeHtml(movie.title) + "海报" loading="lazy">",
          "    <span class="poster-shade"></span>",
          "    <span class="year-badge">" + escapeHtml(movie.year) + "</span>",
          "    <span class="play-badge">▶</span>",
          "  </a>",
          "  <div class="card-body">",
          "    <h3><a href="" + prefix + "/movies/" + escapeHtml(movie.id) + ".html">" + escapeHtml(movie.title) + "</a></h3>",
          "    <p class="card-meta">" + escapeHtml(movie.region) + " · " + escapeHtml(movie.type) + " · " + escapeHtml(movie.genreRaw) + "</p>",
          "    <p class="card-desc">" + escapeHtml(movie.oneLine) + "</p>",
          "    <div class="tag-row">" + tags + "</div>",
          "  </div>",
          "</article>"
        ].join("
");
      }

      function initSearchPage() {
        var container = document.querySelector("[data-search-results]");
        if (!container || !window.MOVIES) {
          return;
        }
        var params = new URLSearchParams(window.location.search);
        var q = params.get("q") || "";
        var input = document.querySelector("[data-global-search-input]");
        var year = document.querySelector("[data-global-year]");
        var type = document.querySelector("[data-global-type]");
        var count = document.querySelector("[data-global-count]");
        var prefix = container.dataset.prefix || ".";
        if (input) {
          input.value = q;
        }

        function render() {
          var keyword = input ? input.value.trim().toLowerCase() : "";
          var selectedYear = year ? year.value : "";
          var selectedType = type ? type.value : "";
          var results = window.MOVIES.filter(function (movie) {
            var text = [movie.title, movie.region, movie.type, movie.genreRaw, movie.oneLine, (movie.tags || []).join(" ")].join(" ").toLowerCase();
            if (keyword && text.indexOf(keyword) === -1) {
              return false;
            }
            if (selectedYear && String(movie.year) !== selectedYear) {
              return false;
            }
            if (selectedType && movie.type !== selectedType) {
              return false;
            }
            return true;
          }).slice(0, 120);

          if (count) {
            count.textContent = "显示 " + results.length + " 条结果";
          }
          if (!results.length) {
            container.innerHTML = "<div class="empty-state">没有找到匹配内容，请尝试更换关键词。</div>";
            return;
          }
          container.innerHTML = results.map(function (movie) {
            return movieCardTemplate(movie, prefix);
          }).join("
");
        }

        [input, year, type].forEach(function (control) {
          if (control) {
            control.addEventListener("input", render);
            control.addEventListener("change", render);
          }
        });
        render();
      }

      document.addEventListener("DOMContentLoaded", function () {
        initMobileMenu();
        initHeroSlider();
        initFilterGrid();
        initSearchPage();
      });
    })();
