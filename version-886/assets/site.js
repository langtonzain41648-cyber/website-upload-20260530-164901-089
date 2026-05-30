(function () {
  function ready(fn) {
    if (document.readyState === "complete") {
      fn();
    } else {
      document.addEventListener("DOMContentLoaded", fn, { once: true });
    }
  }

  function setupMenu() {
    var button = document.querySelector("[data-menu-button]");
    var panel = document.querySelector("[data-mobile-panel]");
    if (!button || !panel) {
      return;
    }
    button.addEventListener("click", function () {
      panel.classList.toggle("open");
    });
  }

  function setupHero() {
    var hero = document.querySelector("[data-hero]");
    if (!hero) {
      return;
    }
    var slides = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-slide]"));
    var thumbs = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-target]"));
    if (!slides.length) {
      return;
    }
    var index = 0;
    var timer = null;

    function show(next) {
      index = (next + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle("active", i === index);
      });
      thumbs.forEach(function (thumb, i) {
        thumb.classList.toggle("active", i === index);
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
      }
    }

    thumbs.forEach(function (thumb) {
      thumb.addEventListener("click", function () {
        var target = parseInt(thumb.getAttribute("data-hero-target") || "0", 10);
        show(target);
        start();
      });
    });

    hero.addEventListener("mouseenter", stop);
    hero.addEventListener("mouseleave", start);
    show(0);
    start();
  }

  function setupLocalFilters() {
    document.querySelectorAll("[data-filter-panel]").forEach(function (panel) {
      var input = panel.querySelector("[data-local-filter]");
      var chips = Array.prototype.slice.call(panel.querySelectorAll("[data-filter]"));
      var list = document.querySelector("[data-card-list]");
      if (!list) {
        return;
      }
      var cards = Array.prototype.slice.call(list.querySelectorAll(".movie-card"));
      var active = "all";

      function apply() {
        var word = input ? input.value.trim().toLowerCase() : "";
        cards.forEach(function (card) {
          var text = card.textContent.toLowerCase();
          var genre = (card.getAttribute("data-genre") || "").toLowerCase();
          var matchWord = !word || text.indexOf(word) !== -1;
          var matchChip = active === "all" || text.indexOf(active.toLowerCase()) !== -1 || genre.indexOf(active.toLowerCase()) !== -1;
          card.classList.toggle("is-hidden-card", !(matchWord && matchChip));
        });
      }

      if (input) {
        input.addEventListener("input", apply);
      }

      chips.forEach(function (chip) {
        chip.addEventListener("click", function () {
          active = chip.getAttribute("data-filter") || "all";
          chips.forEach(function (item) {
            item.classList.toggle("active", item === chip);
          });
          apply();
        });
      });
    });
  }

  function movieCard(movie) {
    var tags = (movie.tags || []).slice(0, 3).map(function (tag) {
      return "<span>" + escapeHtml(tag) + "</span>";
    }).join("");
    return "<article class=\"movie-card\">" +
      "<a class=\"poster-frame\" href=\"" + escapeAttr(movie.url) + "\">" +
      "<img src=\"" + escapeAttr(movie.image) + "\" alt=\"" + escapeAttr(movie.title) + "\" loading=\"lazy\">" +
      "<span class=\"poster-mask\">查看详情</span>" +
      "</a>" +
      "<div class=\"movie-card-body\">" +
      "<div class=\"movie-meta-line\"><span>" + escapeHtml(movie.year) + "</span><span>" + escapeHtml(movie.region) + "</span><span>" + escapeHtml(movie.type) + "</span></div>" +
      "<h3><a href=\"" + escapeAttr(movie.url) + "\">" + escapeHtml(movie.title) + "</a></h3>" +
      "<p>" + escapeHtml(movie.oneLine) + "</p>" +
      "<div class=\"tag-row\">" + tags + "</div>" +
      "</div>" +
      "</article>";
  }

  function escapeHtml(value) {
    return String(value || "").replace(/[&<>"']/g, function (char) {
      return {
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        "\"": "&quot;",
        "'": "&#39;"
      }[char];
    });
  }

  function escapeAttr(value) {
    return escapeHtml(value).replace(/`/g, "&#96;");
  }

  function setupSearchPage() {
    var results = document.querySelector("[data-search-results]");
    if (!results || !window.MOVIES) {
      return;
    }
    var params = new URLSearchParams(window.location.search);
    var queryInput = document.querySelector("[data-search-input]");
    var typeSelect = document.querySelector("[data-search-type]");
    var yearSelect = document.querySelector("[data-search-year]");
    if (queryInput) {
      queryInput.value = params.get("q") || "";
    }

    function render() {
      var q = queryInput ? queryInput.value.trim().toLowerCase() : "";
      var type = typeSelect ? typeSelect.value : "";
      var year = yearSelect ? yearSelect.value : "";
      var list = window.MOVIES.filter(function (movie) {
        var text = [movie.title, movie.region, movie.type, movie.year, movie.genre, movie.oneLine, (movie.tags || []).join(" ")].join(" ").toLowerCase();
        var okQuery = !q || text.indexOf(q) !== -1;
        var okType = !type || movie.type.indexOf(type) !== -1;
        var okYear = !year || movie.year === year;
        return okQuery && okType && okYear;
      }).slice(0, 96);
      if (!list.length) {
        results.innerHTML = "<div class=\"empty-state\">没有找到匹配内容</div>";
      } else {
        results.innerHTML = list.map(movieCard).join("");
      }
    }

    [queryInput, typeSelect, yearSelect].forEach(function (field) {
      if (field) {
        field.addEventListener("input", render);
        field.addEventListener("change", render);
      }
    });
    render();
  }

  ready(function () {
    setupMenu();
    setupHero();
    setupLocalFilters();
    setupSearchPage();
  });
})();
