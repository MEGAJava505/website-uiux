
document.addEventListener('DOMContentLoaded', async () => {
    const sidebarCardsContainer = document.querySelector('.carousel-sidebar');
    const bannerImg = document.querySelector('.carousel-main > img');
    const gameTitle = document.querySelector('.game-title');
    const gameDesc = document.querySelector('.game-desc');
    const priceText = document.querySelector('.price-text');
    const recTabs = document.querySelectorAll('.rec-tab');
    const recCardsContainer = document.querySelector('.rec-cards');

    // 0. Search Suggestions
    initSearchSuggestions();

    // 1. Fetch Featured Games for Sidebar
    const featuredData = await RawgAPI.getFeaturedGames();
    if (featuredData && featuredData.results) {
        // Fetch detailed info for each featured game to get descriptions
        const featuredWithDetails = await Promise.all(
            featuredData.results.map(async (game) => {
                const details = await RawgAPI.getGameDetails(game.id);
                return { ...game, description_raw: details ? details.description_raw : "" };
            })
        );

        sidebarCardsContainer.innerHTML = featuredWithDetails.map((game, index) => {
            const pricing = RawgAPI.getPriceAndDiscount(game);
            const displayPrice = pricing.isFree ? "FREE" : `$${pricing.price}`;
            const img = game.background_image || NO_IMAGE;
            const desc = game.description_raw ? game.description_raw.substring(0, 150) + "..." : `Оценка: ${game.rating} | Релиз: ${game.released}`;

            return `
                <div class="sidebar-card ${index === 0 ? 'active' : ''}" 
                     data-banner="${img}" 
                     data-title="${game.name}" 
                     data-desc="${desc}" 
                     data-price="${displayPrice}">
                    <img src="${img}" alt="${game.name}" onerror="this.src=window.NO_IMAGE">
                    <span>${game.name}</span>
                </div>
            `;
        }).join('');

        // Re-attach sidebar click listeners
        const sidebarCards = document.querySelectorAll('.sidebar-card');
        sidebarCards.forEach(card => {
            card.addEventListener('click', () => {
                sidebarCards.forEach(c => c.classList.remove('active'));
                card.classList.add('active');

                bannerImg.style.opacity = '0';
                setTimeout(() => {
                    bannerImg.src = card.dataset.banner;
                    gameTitle.textContent = card.dataset.title;
                    gameDesc.textContent = card.dataset.desc;
                    if (priceText) priceText.textContent = card.dataset.price;
                    bannerImg.style.opacity = '1';
                }, 200);
            });
        });

        // Set initial banner
        const firstGame = featuredWithDetails[0];
        const initialPricing = RawgAPI.getPriceAndDiscount(firstGame);
        bannerImg.src = firstGame.background_image || NO_IMAGE;
        gameTitle.textContent = firstGame.name;
        gameDesc.textContent = firstGame.description_raw ? firstGame.description_raw.substring(0, 150) + "..." : `Оценка: ${firstGame.rating} | Релиз: ${firstGame.released}`;
        if (priceText) priceText.textContent = initialPricing.isFree ? "FREE" : `$${initialPricing.price}`;
    }

    // 2. Recommendations Section Logic
    async function loadRecCards(type) {
        if (!recCardsContainer) return;

        recCardsContainer.style.opacity = '0';
        let data;

        switch (type) {
            case 'popular': data = await RawgAPI.getPopularGames(); break;
            case 'discounts': data = await RawgAPI.getDiscountedGames(); break;
            case 'recommended': data = await RawgAPI.getRecommendedGames(); break;
            case 'nowplaying': data = await RawgAPI.getNowPlayingGames(); break;
        }

        if (data && data.results) {
            setTimeout(() => {
                recCardsContainer.innerHTML = data.results.map(item => {
                    const pricing = RawgAPI.getPriceAndDiscount(item);
                    const img = item.background_image || NO_IMAGE;

                    return `
                        <div class="rec-card ripple">
                            <div class="rec-card-header">
                                <span>${item.name}</span>
                                <img src="icon/heart.svg" alt="Heart" class="rec-heart">
                            </div>
                            <div class="rec-card-image">
                                <img src="${img}" alt="${item.name}" onerror="this.src=window.NO_IMAGE">
                            </div>
                            <div class="rec-card-footer">
                                <span class="rec-price ${pricing.isFree ? 'free' : ''}">${pricing.isFree ? 'БЕСПЛАТНО' : '$' + pricing.price}</span>
                                ${pricing.discount ? `<span class="rec-discount">${pricing.discount}</span>` : ''}
                                ${pricing.oldPrice ? `<span class="rec-old-price">$${pricing.oldPrice}</span>` : ''}
                            </div>
                        </div>
                    `;
                }).join('');
                initHearts();
                recCardsContainer.style.opacity = '1';
            }, 300);
        }
    }

    recTabs.forEach(tab => {
        tab.addEventListener('click', () => {
            if (tab.classList.contains('active')) return;
            recTabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            loadRecCards(tab.dataset.tab);
        });
    });

    // Initial load for popular tab
    loadRecCards('popular');

    // 3. Global Search Logic
    const searchInput = document.querySelector('.search-input');
    if (searchInput) {
        searchInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                const query = searchInput.value.trim();
                if (query) {
                    window.location.href = `catalog.html?search=${encodeURIComponent(query)}`;
                }
            }
        });
    }

    const mainHeader = document.querySelector('header:not(.second_head)');
    let lastScrollY = window.scrollY;

    window.addEventListener('scroll', () => {
        const currentScrollY = window.scrollY;

        if (currentScrollY > 100) {
            if (currentScrollY > lastScrollY) {
                mainHeader.classList.add('hide-nav');
            } else {
                mainHeader.classList.remove('hide-nav');
            }
        } else {
            mainHeader.classList.remove('hide-nav');
        }

        lastScrollY = currentScrollY;
    });


    // 4. Horizontal Scroll for Recommendations and Categories
    function setupScroll(containerSelector, prevBtnSelector, nextBtnSelector) {
        const container = document.querySelector(containerSelector);
        const prevBtn = document.querySelector(prevBtnSelector);
        const nextBtn = document.querySelector(nextBtnSelector);

        if (!container || !prevBtn || !nextBtn) return;

        const scrollAmount = 300;
        prevBtn.addEventListener('click', () => {
            container.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
        });
        nextBtn.addEventListener('click', () => {
            container.scrollBy({ left: scrollAmount, behavior: 'smooth' });
        });
    }

    setupScroll('.rec-cards', '.rec-nav-btn.prev', '.rec-nav-btn.next');
    setupScroll('.category-list', '.category-prev', '.category-next');

    // 5. Scroll navigation with dots for Categories
    const catList = document.querySelector('.category-list');
    const catDots = document.querySelectorAll('.cat-page-line');
    if (catList && catDots.length > 0) {
        catList.addEventListener('scroll', () => {
            const scrollPercent = catList.scrollLeft / (catList.scrollWidth - catList.clientWidth || 1);
            const activeIndex = Math.min(Math.floor(scrollPercent * catDots.length), catDots.length - 1);
            catDots.forEach((dot, i) => {
                dot.classList.toggle('active', i === activeIndex);
            });
        });
    }

    // Category Card Link Logic (Filtering)
    document.querySelectorAll('.category-card').forEach(card => {
        card.addEventListener('click', (e) => {
            e.preventDefault();
            const genre = card.querySelector('.category-name').textContent.trim();
            // Map Russian names to RAWG slugs or just pass as search term for now
            // Better: use data-genre if I add it to index.html
            const genreMap = {
                'ОТКРЫТЫЙ МИР': 'open-world',
                'СТРАТЕГИЯ': 'strategy',
                'КООП': 'coop',
                'БЕСПЛАТНО': 'free'
            };
            const slug = genreMap[genre] || genre.toLowerCase();
            window.location.href = `catalog.html?genre=${slug}`;
        });
    });

    // 5. Timer and Friday Date
    function updateGiveawayDate() {
        const dateEl = document.getElementById('next-friday-date');
        if (!dateEl) return;

        const now = new Date();
        const nextFriday = new Date();
        nextFriday.setDate(now.getDate() + (5 + 7 - now.getDay()) % 7);
        if (now.getDay() === 5 && now.getHours() >= 17) {
            nextFriday.setDate(nextFriday.getDate() + 7);
        }

        const options = { day: 'numeric', month: 'long' };
        dateEl.textContent = nextFriday.toLocaleDateString('ru-RU', options);
    }

    function startTimer() {
        const timerEl = document.querySelector('.feature-timer');
        if (!timerEl) return;

        let totalSeconds = 7 * 24 * 3600 + 12 * 3600 + 43 * 60 + 5;

        setInterval(() => {
            if (totalSeconds <= 0) return;
            totalSeconds--;

            const d = Math.floor(totalSeconds / (24 * 3600));
            const h = Math.floor((totalSeconds % (24 * 3600)) / 3600);
            const m = Math.floor((totalSeconds % 3600) / 60);
            const s = totalSeconds % 60;

            timerEl.innerHTML = `
                <span>${String(d).padStart(2, '0')}</span> : 
                <span>${String(h).padStart(2, '0')}</span> : 
                <span>${String(m).padStart(2, '0')}</span> : 
                <span>${String(s).padStart(2, '0')}</span>
            `;
        }, 1000);
    }

    updateGiveawayDate();
    startTimer();

    // 6. Games List Tab Switching & Vertical Expansion
    const columnStates = {
        'col-1': { type: 'bestsellers', expanded: false },
        'col-2': { type: 'popular', expanded: false }
    };

    async function loadGamesList(type, containerSelector, limit = 5) {
        const container = document.querySelector(containerSelector);
        if (!container) return;

        // Don't fully clear opacity to avoid flicker, just maybe dim? 
        // Or keeps it simple.
        container.style.opacity = '0.5';

        let data;
        // Fetch a bit more to have overhead if needed, or exact amount
        if (type === 'bestsellers') {
            data = await RawgAPI.fetchGames({ ordering: '-rating', page_size: limit });
        } else {
            data = await RawgAPI.getPopularGames();
            if (data) data.results = data.results.slice(0, limit);
        }

        if (data && data.results) {
            container.innerHTML = data.results.map(game => {
                const pricing = RawgAPI.getPriceAndDiscount(game);
                const displayPrice = pricing.isFree ? "БЕСПЛАТНО" : `$${pricing.price}`;
                const rating = game.rating || 0;
                const img = game.background_image || window.NO_IMAGE;

                return `
                    <div class="game-card ripple">
                        <img src="${img}" class="game-img" alt="${game.name}" onerror="this.src=window.NO_IMAGE">
                        <div class="game-details">
                            <div class="game-title">${game.name}</div>
                            <div class="game-rating-row">
                                <div class="stars-container">
                                    <div class="stars-bg">
                                        ${'<img src="icon/star.svg" alt="star">'.repeat(5)}
                                    </div>
                                    <div class="stars-fill" style="width: ${(rating / 5) * 100}%">
                                        ${'<img src="icon/star-filled.svg" alt="star">'.repeat(5)}
                                    </div>
                                </div>
                                <div class="rating-box">${rating}</div>
                                <div class="platform-box">
                                    <img src="icon/windows.svg" class="platform-icon" alt="Windows">
                                </div>
                            </div>
                            <div class="game-actions">
                                <img src="icon/heart.svg" class="wishlist-icon" alt="Wishlist">
                            </div>
                        </div>
                        <div class="game-price-block">
                            ${pricing.discount ? `<div class="game-discount">${pricing.discount}</div>` : ''}
                            <div class="game-price-col">
                                ${pricing.oldPrice ? `<div class="game-price-old">$${pricing.oldPrice}</div>` : ''}
                                <div class="game-price-new ${pricing.isFree ? 'free' : ''}">${displayPrice}</div>
                            </div>
                        </div>
                    </div>
                `;
            }).join('');
            initHearts();
            container.style.opacity = '1';
        }
    }

    // Initial Load
    loadGamesList('bestsellers', '.games-column.col-1', 5);
    loadGamesList('popular', '.games-column.col-2', 5);

    // Tab Click Logic (Just resets/focuses for now, maybe scroll to?)
    const gamesTabs = document.querySelectorAll('.games-tab');
    gamesTabs.forEach((tab, index) => {
        tab.addEventListener('click', () => {
            // Optional: Highlight tab?
            gamesTabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
        });
    });

    // Column Click Logic (Expand/Collapse)
    const columns = document.querySelectorAll('.games-column');
    columns.forEach((col, index) => {
        col.addEventListener('click', (e) => {
            // Avoid triggering when clicking interactive elements inside cards (like hearts)
            if (e.target.closest('.wishlist-icon') || e.target.closest('.btn')) return;

            const colKey = `col-${index + 1}`;
            const state = columnStates[colKey];

            // Toggle state
            state.expanded = !state.expanded;

            // Load new amount
            loadGamesList(state.type, `.games-column.${colKey}`, state.expanded ? 10 : 5);
        });
    });

    // 7. News Expansion
    const newsBtn = document.querySelector('.news-more-btn');
    const newsContainer = document.querySelector('.news-container');
    if (newsBtn && newsContainer) {
        newsBtn.addEventListener('click', () => {
            const isExpanded = newsContainer.classList.toggle('expanded');
            newsBtn.textContent = isExpanded ? 'Свернуть' : 'Развернуть';
        });
    }

    // 8. Toggles for Header/Footer
    function setupToggles(selector) {
        const elements = document.querySelectorAll(selector);
        elements.forEach(el => {
            el.addEventListener('click', () => {
                const parent = el.parentElement;
                parent.querySelectorAll(selector).forEach(sib => sib.classList.remove('active-setting', 'active'));
                el.classList.add('active-setting', 'active');
            });
        });
    }

    setupToggles('.setting-options span');
    setupToggles('.header-icons img');

    // 9. Extra Button Feedback
    document.querySelectorAll('.btn-play, .feature-more-btn, .cat-banner-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const originalText = btn.textContent;
            btn.textContent = 'Загрузка...';
            btn.style.opacity = '0.7';
            setTimeout(() => {
                btn.textContent = originalText;
                btn.style.opacity = '1';
                if (btn.classList.contains('cat-banner-btn')) return; // Already transitions
                alert('Эта функция будет доступна в полной версии магазина!');
            }, 600);
        });
    });

    function initHearts() {
        document.querySelectorAll('.rec-heart, .wishlist-icon, .cat-card-heart').forEach(heart => {
            heart.addEventListener('click', (e) => {
                e.stopPropagation();
                heart.classList.toggle('liked');
            });
        });
    }

    initHearts();
});
// Search Suggestions Logic
function initSearchSuggestions() {
    const searchInput = document.querySelector('.search-input');
    const searchPanel = document.querySelector('.search-panel');
    if (!searchInput || !searchPanel) return;

    // Create dropdown element
    const dropdown = document.createElement('div');
    dropdown.className = 'search-dropdown';
    document.body.appendChild(dropdown);

    const updatePosition = () => {
        if (!dropdown.classList.contains('active')) return;
        const rect = searchPanel.getBoundingClientRect();
        dropdown.style.top = `${rect.bottom}px`;
        dropdown.style.left = `${rect.left}px`;
        dropdown.style.width = `${rect.width}px`;
    };

    window.addEventListener('scroll', updatePosition);
    window.addEventListener('resize', updatePosition);

    let debounceTimer;

    searchInput.addEventListener('input', (e) => {
        const query = e.target.value.trim();
        clearTimeout(debounceTimer);

        if (query.length < 2) {
            dropdown.classList.remove('active');
            return;
        }

        debounceTimer = setTimeout(async () => {
            const data = await RawgAPI.searchGames(query);
            if (data && data.results && data.results.length > 0) {
                renderSuggestions(data.results.slice(0, 5)); // Show top 5
                updatePosition();
            } else {
                dropdown.classList.remove('active');
            }
        }, 300);
    });

    // Hide on click outside
    document.addEventListener('click', (e) => {
        if (!searchPanel.contains(e.target) && !dropdown.contains(e.target)) {
            dropdown.classList.remove('active');
        }
    });

    // Handle Enter key
    searchInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            const query = searchInput.value.trim();
            if (window.location.pathname.endsWith('catalog.html')) {
                const newUrl = new URL(window.location.href);
                if (query) {
                    newUrl.searchParams.set('search', query);
                } else {
                    newUrl.searchParams.delete('search');
                }
                window.history.pushState({}, '', newUrl);

                const event = new CustomEvent('search-updated', { detail: { search: query } });
                document.dispatchEvent(event);
                dropdown.classList.remove('active');
            } else {
                window.location.href = `catalog.html?search=${encodeURIComponent(query)}`;
            }
        }
    });

    function renderSuggestions(games) {
        dropdown.innerHTML = games.map(game => {
            const img = game.background_image || window.NO_IMAGE;
            // Use data attributes to store game info for the click handler
            return `
                <div class="search-item" data-name="${game.name}">
                    <img src="${img}" alt="${game.name}" onerror="this.src=window.NO_IMAGE">
                    <div class="search-item-info">
                        <span class="search-item-title">${game.name}</span>
                        <span class="search-item-year">${game.released ? game.released.substring(0, 4) : ''}</span>
                    </div>
                </div>
            `;
        }).join('');
        dropdown.classList.add('active');

        // Add click listeners to items
        dropdown.querySelectorAll('.search-item').forEach(item => {
            item.addEventListener('click', () => {
                const gameName = item.dataset.name;
                const targetUrl = `catalog.html?search=${encodeURIComponent(gameName)}`;

                if (window.location.pathname.endsWith('catalog.html')) {
                    // We are already on catalog, just update state and trigger render
                    const newUrl = new URL(window.location.href);
                    newUrl.searchParams.set('search', gameName);
                    window.history.pushState({}, '', newUrl);

                    // Dispatch custom event for catalog.js to pick up
                    const event = new CustomEvent('search-updated', { detail: { search: gameName } });
                    document.dispatchEvent(event);

                    // Update input
                    searchInput.value = gameName;
                    dropdown.classList.remove('active');
                } else {
                    // Go to catalog
                    window.location.href = targetUrl;
                }
            });
        });
    }
}
