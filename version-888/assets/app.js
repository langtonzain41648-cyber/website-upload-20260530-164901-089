(function () {
    var body = document.body;
    var menuButton = document.querySelector('.menu-button');

    if (menuButton) {
        menuButton.addEventListener('click', function () {
            body.classList.toggle('menu-open');
        });
    }

    var hero = document.querySelector('[data-hero]');

    if (hero) {
        var slides = Array.prototype.slice.call(hero.querySelectorAll('.hero-slide'));
        var dots = Array.prototype.slice.call(hero.querySelectorAll('.hero-dot'));
        var current = 0;
        var timer;

        function showSlide(index) {
            current = (index + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle('active', slideIndex === current);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle('active', dotIndex === current);
            });
        }

        function startHero() {
            clearInterval(timer);
            timer = setInterval(function () {
                showSlide(current + 1);
            }, 5200);
        }

        dots.forEach(function (dot, index) {
            dot.addEventListener('click', function () {
                showSlide(index);
                startHero();
            });
        });

        startHero();
    }

    function normalize(value) {
        return String(value || '').toLowerCase().replace(/\s+/g, '');
    }

    function setupFilter(panel) {
        var scope = panel.closest('section') || document;
        var cards = Array.prototype.slice.call(scope.querySelectorAll('[data-card]'));
        var input = panel.querySelector('[data-filter-input]');
        var buttons = Array.prototype.slice.call(panel.querySelectorAll('[data-filter-year], [data-filter-type], [data-filter-all]'));
        var state = {
            query: '',
            year: '',
            type: ''
        };

        function cardText(card) {
            return normalize([
                card.getAttribute('data-title'),
                card.getAttribute('data-region'),
                card.getAttribute('data-year'),
                card.getAttribute('data-type'),
                card.getAttribute('data-genre'),
                card.textContent
            ].join(' '));
        }

        function render() {
            cards.forEach(function (card) {
                var matchesQuery = !state.query || cardText(card).indexOf(state.query) !== -1;
                var matchesYear = !state.year || card.getAttribute('data-year') === state.year;
                var matchesType = !state.type || normalize(card.getAttribute('data-type')).indexOf(normalize(state.type)) !== -1;
                card.classList.toggle('hidden-card', !(matchesQuery && matchesYear && matchesType));
            });
        }

        if (input) {
            input.addEventListener('input', function () {
                state.query = normalize(input.value);
                render();
            });
        }

        buttons.forEach(function (button) {
            button.addEventListener('click', function () {
                buttons.forEach(function (item) {
                    item.classList.remove('active');
                });
                button.classList.add('active');
                state.year = button.getAttribute('data-filter-year') || '';
                state.type = button.getAttribute('data-filter-type') || '';
                render();
            });
        });
    }

    Array.prototype.slice.call(document.querySelectorAll('[data-filter-panel]')).forEach(setupFilter);

    Array.prototype.slice.call(document.querySelectorAll('[data-page-search]')).forEach(function (form) {
        form.addEventListener('submit', function (event) {
            var input = form.querySelector('input[type="search"]');
            if (input && input.value.trim()) {
                event.preventDefault();
                var target = document.querySelector('[data-filter-input]');
                if (target) {
                    target.value = input.value.trim();
                    target.dispatchEvent(new Event('input', { bubbles: true }));
                    target.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }
            }
        });
    });
}());
