(function () {
  var body = document.body;
  var menuButton = document.querySelector('.menu-toggle');

  if (menuButton) {
    menuButton.addEventListener('click', function () {
      body.classList.toggle('nav-open');
    });
  }

  var hero = document.querySelector('[data-hero]');
  if (hero) {
    var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
    var prev = hero.querySelector('[data-hero-prev]');
    var next = hero.querySelector('[data-hero-next]');
    var current = 0;
    var timer = null;

    function showSlide(index) {
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

    function startHero() {
      stopHero();
      timer = window.setInterval(function () {
        showSlide(current + 1);
      }, 5200);
    }

    function stopHero() {
      if (timer) {
        window.clearInterval(timer);
        timer = null;
      }
    }

    if (prev) {
      prev.addEventListener('click', function () {
        showSlide(current - 1);
        startHero();
      });
    }

    if (next) {
      next.addEventListener('click', function () {
        showSlide(current + 1);
        startHero();
      });
    }

    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        showSlide(Number(dot.getAttribute('data-hero-dot')) || 0);
        startHero();
      });
    });

    hero.addEventListener('mouseenter', stopHero);
    hero.addEventListener('mouseleave', startHero);
    showSlide(0);
    startHero();
  }

  var searchInput = document.querySelector('[data-movie-search]');
  var yearFilter = document.querySelector('[data-year-filter]');
  var categoryFilter = document.querySelector('[data-category-filter]');
  var items = Array.prototype.slice.call(document.querySelectorAll('[data-search]'));

  function applyFilters() {
    var keyword = searchInput ? searchInput.value.trim().toLowerCase() : '';
    var year = yearFilter ? yearFilter.value : '';
    var category = categoryFilter ? categoryFilter.value : '';

    items.forEach(function (item) {
      var haystack = item.getAttribute('data-search') || '';
      var itemYear = item.getAttribute('data-year') || '';
      var itemCategory = item.getAttribute('data-category') || '';
      var matched = true;

      if (keyword && haystack.indexOf(keyword) === -1) {
        matched = false;
      }
      if (year && itemYear !== year) {
        matched = false;
      }
      if (category && itemCategory !== category) {
        matched = false;
      }

      item.classList.toggle('is-hidden', !matched);
    });
  }

  if (searchInput) {
    searchInput.addEventListener('input', applyFilters);
  }
  if (yearFilter) {
    yearFilter.addEventListener('change', applyFilters);
  }
  if (categoryFilter) {
    categoryFilter.addEventListener('change', applyFilters);
  }
})();
