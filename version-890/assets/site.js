(function () {
  var menuButton = document.querySelector('[data-menu-toggle]');
  var mobilePanel = document.querySelector('[data-mobile-panel]');

  if (menuButton && mobilePanel) {
    menuButton.addEventListener('click', function () {
      mobilePanel.classList.toggle('open');
    });
  }

  var hero = document.querySelector('[data-hero]');

  if (hero) {
    var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
    var current = 0;

    function setHeroSlide(index) {
      if (!slides.length) {
        return;
      }

      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('active', slideIndex === current);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('active', dotIndex === current);
      });
    }

    dots.forEach(function (dot, index) {
      dot.addEventListener('click', function () {
        setHeroSlide(index);
      });
    });

    window.setInterval(function () {
      setHeroSlide(current + 1);
    }, 5200);
  }

  Array.prototype.slice.call(document.querySelectorAll('[data-filter-input]')).forEach(function (input) {
    var section = input.closest('section') || document;
    var cards = Array.prototype.slice.call(section.querySelectorAll('[data-card]'));

    input.addEventListener('input', function () {
      var query = input.value.trim().toLowerCase();

      cards.forEach(function (card) {
        var haystack = [
          card.getAttribute('data-title'),
          card.getAttribute('data-tags'),
          card.getAttribute('data-genre'),
          card.getAttribute('data-region')
        ].join(' ').toLowerCase();

        card.classList.toggle('hidden', query && haystack.indexOf(query) === -1);
      });
    });
  });

  function bindPlayer() {
    var video = document.querySelector('.video-player');
    var overlay = document.querySelector('.play-overlay');

    if (!video || !overlay) {
      return;
    }

    var started = false;

    function prepareVideo() {
      if (started) {
        return;
      }

      started = true;
      var source = video.getAttribute('data-src');
      video.setAttribute('controls', 'controls');

      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = source;
      } else if (window.Hls && window.Hls.isSupported()) {
        var hls = new window.Hls({ enableWorker: true });
        hls.loadSource(source);
        hls.attachMedia(video);
        video._hls = hls;
      } else {
        video.src = source;
      }
    }

    function playVideo() {
      prepareVideo();
      overlay.classList.add('hidden');
      var playPromise = video.play();

      if (playPromise && typeof playPromise.catch === 'function') {
        playPromise.catch(function () {});
      }
    }

    overlay.addEventListener('click', playVideo);
    video.addEventListener('click', function () {
      if (!started || video.paused) {
        playVideo();
      }
    });
  }

  function createSearchCard(movie) {
    var tags = (movie.tags || []).slice(0, 3).map(function (tag) {
      return '<span>' + escapeHtml(tag) + '</span>';
    }).join('');

    return [
      '<a class="movie-card" href="' + escapeHtml(movie.url) + '">',
      '  <div class="poster-wrap">',
      '    <img src="' + escapeHtml(movie.cover) + '" alt="' + escapeHtml(movie.title) + '" loading="lazy">',
      '    <span class="year-badge">' + escapeHtml(movie.year) + '</span>',
      '  </div>',
      '  <div class="card-body">',
      '    <h3>' + escapeHtml(movie.title) + '</h3>',
      '    <p>' + escapeHtml(movie.oneLine) + '</p>',
      '    <div class="card-meta"><span>' + escapeHtml(movie.region) + '</span><span>' + escapeHtml(movie.type) + '</span></div>',
      '    <div class="tag-row">' + tags + '</div>',
      '  </div>',
      '</a>'
    ].join('');
  }

  function escapeHtml(value) {
    return String(value || '').replace(/[&<>"]/g, function (character) {
      return {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;'
      }[character];
    });
  }

  function bindSearchPage() {
    var searchPage = document.querySelector('[data-search-page]');

    if (!searchPage || !window.SEARCH_INDEX) {
      return;
    }

    var input = searchPage.querySelector('[data-search-input]');
    var results = searchPage.querySelector('[data-search-results]');
    var status = searchPage.querySelector('[data-search-status]');
    var params = new URLSearchParams(window.location.search);
    var initialQuery = params.get('q') || '';

    input.value = initialQuery;

    function render(query) {
      var normalized = query.trim().toLowerCase();

      if (!normalized) {
        results.innerHTML = '';
        status.textContent = '输入关键词查找影片';
        return;
      }

      var matched = window.SEARCH_INDEX.filter(function (movie) {
        var haystack = [
          movie.title,
          movie.region,
          movie.type,
          movie.year,
          movie.genre,
          (movie.tags || []).join(' '),
          movie.oneLine,
          movie.summary
        ].join(' ').toLowerCase();

        return haystack.indexOf(normalized) !== -1;
      });

      status.textContent = matched.length ? '搜索结果' : '未找到匹配影片';
      results.innerHTML = matched.map(createSearchCard).join('');
    }

    render(initialQuery);

    input.addEventListener('input', function () {
      render(input.value);
    });
  }

  bindPlayer();
  bindSearchPage();
})();
