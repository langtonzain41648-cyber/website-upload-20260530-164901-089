(function () {
  var menuButton = document.querySelector('[data-menu-button]');
  var mobilePanel = document.querySelector('[data-mobile-panel]');
  if (menuButton && mobilePanel) {
    menuButton.addEventListener('click', function () {
      mobilePanel.classList.toggle('open');
    });
  }

  var slides = Array.prototype.slice.call(document.querySelectorAll('.hero-slide'));
  var dots = Array.prototype.slice.call(document.querySelectorAll('.hero-dot'));
  if (slides.length > 1) {
    var activeIndex = Math.max(0, slides.findIndex(function (slide) {
      return slide.classList.contains('active');
    }));

    var showSlide = function (index) {
      activeIndex = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('active', slideIndex === activeIndex);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('active', dotIndex === activeIndex);
      });
    };

    dots.forEach(function (dot, index) {
      dot.addEventListener('click', function () {
        showSlide(index);
      });
    });

    window.setInterval(function () {
      showSlide(activeIndex + 1);
    }, 5200);
  }

  var listFilter = document.querySelector('[data-list-filter]');
  if (listFilter) {
    var cards = Array.prototype.slice.call(document.querySelectorAll('[data-card]'));
    listFilter.addEventListener('input', function () {
      var value = listFilter.value.trim().toLowerCase();
      cards.forEach(function (card) {
        var text = (card.getAttribute('data-keywords') || '').toLowerCase();
        card.style.display = !value || text.indexOf(value) !== -1 ? '' : 'none';
      });
    });
  }

  var searchPage = document.querySelector('[data-search-page]');
  if (searchPage && window.SEARCH_INDEX) {
    var params = new URLSearchParams(window.location.search);
    var q = (params.get('q') || '').trim();
    var input = searchPage.querySelector('input[name="q"]');
    var resultBox = document.getElementById('search-results');
    if (input) {
      input.value = q;
    }

    var renderCard = function (item) {
      var tags = item.tags.slice(0, 3).map(function (tag) {
        return '<span>' + escapeHtml(tag) + '</span>';
      }).join('');
      return '<a class="movie-card" href="' + item.file + '" data-card>' +
        '<figure class="poster-wrap">' +
        '<img src="' + item.cover + '" alt="' + escapeHtml(item.title) + '" loading="lazy">' +
        '<span class="type-pill">' + escapeHtml(item.type) + '</span>' +
        '<span class="year-pill">' + escapeHtml(item.year) + '</span>' +
        '<span class="play-mark">▶</span>' +
        '</figure>' +
        '<div class="movie-card-body">' +
        '<div class="meta-row"><span>' + escapeHtml(item.region) + '</span><span>' + escapeHtml(item.genre) + '</span></div>' +
        '<h3>' + escapeHtml(item.title) + '</h3>' +
        '<p>' + escapeHtml(item.oneLine) + '</p>' +
        '<div class="tag-row">' + tags + '</div>' +
        '</div>' +
        '</a>';
    };

    var escapeHtml = function (value) {
      return String(value).replace(/[&<>"']/g, function (match) {
        return {
          '&': '&amp;',
          '<': '&lt;',
          '>': '&gt;',
          '"': '&quot;',
          "'": '&#39;'
        }[match];
      });
    };

    if (resultBox) {
      if (!q) {
        resultBox.innerHTML = '<div class="empty-state">输入影片名称、类型、地区或标签即可搜索。</div>';
      } else {
        var needle = q.toLowerCase();
        var results = window.SEARCH_INDEX.filter(function (item) {
          return item.keywords.toLowerCase().indexOf(needle) !== -1;
        }).slice(0, 120);
        resultBox.innerHTML = results.length ? results.map(renderCard).join('') : '<div class="empty-state">未找到相关影片，请尝试其他关键词。</div>';
      }
    }
  }
})();
