(function () {
  function ready(callback) {
    if (document.readyState !== 'loading') {
      callback();
    } else {
      document.addEventListener('DOMContentLoaded', callback);
    }
  }

  function initMenu() {
    var button = document.querySelector('[data-menu-toggle]');
    var panel = document.querySelector('[data-menu-panel]');
    if (!button || !panel) {
      return;
    }
    button.addEventListener('click', function () {
      panel.classList.toggle('open');
    });
  }

  function initHero() {
    var hero = document.querySelector('[data-hero]');
    if (!hero) {
      return;
    }
    var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
    var prev = hero.querySelector('[data-hero-prev]');
    var next = hero.querySelector('[data-hero-next]');
    var index = 0;
    var timer = null;

    function show(nextIndex) {
      if (!slides.length) {
        return;
      }
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('active', slideIndex === index);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('active', dotIndex === index);
      });
    }

    function restart() {
      if (timer) {
        window.clearInterval(timer);
      }
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5000);
    }

    if (prev) {
      prev.addEventListener('click', function () {
        show(index - 1);
        restart();
      });
    }
    if (next) {
      next.addEventListener('click', function () {
        show(index + 1);
        restart();
      });
    }
    dots.forEach(function (dot, dotIndex) {
      dot.addEventListener('click', function () {
        show(dotIndex);
        restart();
      });
    });

    show(0);
    restart();
  }

  function initLocalFilters() {
    var inputs = Array.prototype.slice.call(document.querySelectorAll('[data-filter-input]'));
    inputs.forEach(function (input) {
      var section = input.closest('section') || document;
      var cards = Array.prototype.slice.call(section.querySelectorAll('[data-card]'));
      input.addEventListener('input', function () {
        var query = input.value.trim().toLowerCase();
        cards.forEach(function (card) {
          var haystack = [
            card.dataset.title,
            card.dataset.region,
            card.dataset.type,
            card.dataset.year,
            card.dataset.genre
          ].join(' ').toLowerCase();
          card.classList.toggle('hidden-by-filter', query && haystack.indexOf(query) === -1);
        });
      });
    });
  }

  function loadHlsLibrary(callback) {
    if (window.Hls) {
      callback();
      return;
    }
    var existing = document.querySelector('script[data-hls-loader]');
    if (existing) {
      existing.addEventListener('load', callback);
      return;
    }
    var script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/npm/hls.js@1.5.17/dist/hls.min.js';
    script.defer = true;
    script.dataset.hlsLoader = 'true';
    script.addEventListener('load', callback);
    document.head.appendChild(script);
  }

  function initPlayers() {
    var players = Array.prototype.slice.call(document.querySelectorAll('[data-player]'));
    players.forEach(function (player) {
      var video = player.querySelector('video');
      var button = player.querySelector('[data-player-button]');
      var overlay = player.querySelector('[data-player-overlay]');
      var status = player.querySelector('[data-player-status]');
      var source = player.dataset.m3u8;
      var started = false;
      var hlsInstance = null;

      function setStatus(message) {
        if (status) {
          status.textContent = message;
        }
      }

      function start() {
        if (started || !video || !source) {
          return;
        }
        started = true;
        if (overlay) {
          overlay.style.display = 'none';
        }
        setStatus('正在加载播放源...');

        if (video.canPlayType('application/vnd.apple.mpegurl')) {
          video.src = source;
          video.play().catch(function () {
            setStatus('浏览器已拦截自动播放，请再次点击播放器。');
          });
          return;
        }

        loadHlsLibrary(function () {
          if (window.Hls && window.Hls.isSupported()) {
            hlsInstance = new window.Hls({
              enableWorker: true,
              lowLatencyMode: true
            });
            hlsInstance.loadSource(source);
            hlsInstance.attachMedia(video);
            hlsInstance.on(window.Hls.Events.MANIFEST_PARSED, function () {
              setStatus('播放源加载完成，可以开始观看。');
              video.play().catch(function () {
                setStatus('播放源加载完成，请点击视频播放。');
              });
            });
            hlsInstance.on(window.Hls.Events.ERROR, function (event, data) {
              if (!data || !data.fatal) {
                return;
              }
              if (data.type === window.Hls.ErrorTypes.NETWORK_ERROR) {
                setStatus('网络加载异常，正在尝试重新连接。');
                hlsInstance.startLoad();
              } else if (data.type === window.Hls.ErrorTypes.MEDIA_ERROR) {
                setStatus('媒体解码异常，正在尝试恢复。');
                hlsInstance.recoverMediaError();
              } else {
                setStatus('播放器初始化失败，请刷新页面重试。');
                hlsInstance.destroy();
              }
            });
          } else {
            setStatus('当前浏览器不支持 HLS 播放。');
          }
        });
      }

      if (button) {
        button.addEventListener('click', start);
      }
      if (video) {
        video.addEventListener('click', function () {
          if (!started) {
            start();
          }
        });
        window.addEventListener('beforeunload', function () {
          if (hlsInstance) {
            hlsInstance.destroy();
          }
        });
      }
    });
  }

  function uniqueSorted(data, key) {
    var seen = {};
    data.forEach(function (item) {
      if (item[key]) {
        seen[item[key]] = true;
      }
    });
    return Object.keys(seen).sort(function (a, b) {
      return String(b).localeCompare(String(a), 'zh-CN');
    });
  }

  function renderSearchCard(movie) {
    var tags = (movie.tags || []).slice(0, 3).map(function (tag) {
      return '<span>' + escapeHtml(tag) + '</span>';
    }).join('');
    return [
      '<article class="movie-card">',
      '  <a href="' + movie.url + '" class="poster-frame">',
      '    <img src="' + movie.cover + '" alt="' + escapeHtml(movie.title) + '" loading="lazy" decoding="async">',
      '    <span class="type-badge">' + escapeHtml(movie.type) + '</span>',
      '  </a>',
      '  <div class="card-body">',
      '    <a href="' + movie.url + '" class="card-title">' + escapeHtml(movie.title) + '</a>',
      '    <p class="meta-line">' + escapeHtml(movie.region) + ' · ' + escapeHtml(movie.year) + '</p>',
      '    <p class="card-desc">' + escapeHtml(movie.oneLine || '') + '</p>',
      '    <div class="tag-row">' + tags + '</div>',
      '  </div>',
      '</article>'
    ].join('');
  }

  function escapeHtml(value) {
    return String(value || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  function initSearchPage() {
    var input = document.getElementById('site-search-input');
    var typeSelect = document.getElementById('site-search-type');
    var regionSelect = document.getElementById('site-search-region');
    var yearSelect = document.getElementById('site-search-year');
    var results = document.getElementById('site-search-results');
    var summary = document.getElementById('site-search-summary');
    var data = window.MovieIndex || [];

    if (!input || !results || !summary || !data.length) {
      return;
    }

    function fillSelect(select, values) {
      values.forEach(function (value) {
        var option = document.createElement('option');
        option.value = value;
        option.textContent = value;
        select.appendChild(option);
      });
    }

    fillSelect(typeSelect, uniqueSorted(data, 'type'));
    fillSelect(regionSelect, uniqueSorted(data, 'region'));
    fillSelect(yearSelect, uniqueSorted(data, 'year'));

    function search() {
      var query = input.value.trim().toLowerCase();
      var type = typeSelect.value;
      var region = regionSelect.value;
      var year = yearSelect.value;
      var matched = data.filter(function (movie) {
        var haystack = [
          movie.title,
          movie.region,
          movie.type,
          movie.year,
          movie.genre,
          (movie.tags || []).join(' '),
          movie.oneLine
        ].join(' ').toLowerCase();
        return (!query || haystack.indexOf(query) !== -1) &&
          (!type || movie.type === type) &&
          (!region || movie.region === region) &&
          (!year || movie.year === year);
      }).slice(0, 80);

      summary.textContent = '找到 ' + matched.length + ' 条结果' + (matched.length === 80 ? '（仅展示前 80 条）' : '') + '。';
      results.innerHTML = matched.map(renderSearchCard).join('');
    }

    [input, typeSelect, regionSelect, yearSelect].forEach(function (element) {
      element.addEventListener('input', search);
      element.addEventListener('change', search);
    });
    search();
  }

  ready(function () {
    initMenu();
    initHero();
    initLocalFilters();
    initPlayers();
    initSearchPage();
  });
})();
