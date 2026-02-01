
document.addEventListener('DOMContentLoaded', () => {
    const sidebarCards = document.querySelectorAll('.sidebar-card');
    const bannerImg = document.querySelector('.carousel-main > img');
    const gameTitle = document.querySelector('.game-title');
    const gameDesc = document.querySelector('.game-desc');
    const priceText = document.querySelector('.price-text');

    sidebarCards.forEach(card => {
        card.addEventListener('click', () => {

            sidebarCards.forEach(c => c.classList.remove('active'));


            card.classList.add('active');


            const contentBox = document.querySelector('.content-box');
            const btnPlay = document.querySelector('.btn-play');

            bannerImg.style.opacity = '0';
            if (contentBox) contentBox.style.opacity = '0';
            if (priceText) priceText.style.opacity = '0';
            if (btnPlay) btnPlay.style.opacity = '0';

            setTimeout(() => {
                bannerImg.src = card.dataset.banner;
                gameTitle.textContent = card.dataset.title;
                gameDesc.textContent = card.dataset.desc;
                priceText.textContent = card.dataset.price;

                bannerImg.style.opacity = '1';
                if (contentBox) contentBox.style.opacity = '1';
                if (priceText) priceText.style.opacity = '1';
                if (btnPlay) btnPlay.style.opacity = '1';
            }, 200);
        });
    });

    const dateSpan = document.getElementById('next-friday-date');
    if (dateSpan) {
        const today = new Date();
        const nextFriday = new Date();

        const dayOfWeek = today.getDay();

        let daysToAdd = (5 - dayOfWeek + 7) % 7;
        if (daysToAdd === 0) daysToAdd = 7;

        nextFriday.setDate(today.getDate() + daysToAdd);


        const options = {
            day: 'numeric',
            month: 'long'
        };
        dateSpan.textContent = nextFriday.toLocaleDateString('ru-RU', options);
    }

    const revealCallback = (entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('reveal-active');

                observer.unobserve(entry.target);
            }
        });
    };

    const revealObserver = new IntersectionObserver(revealCallback, {
        threshold: 0.15
    });


    document.querySelectorAll('.reveal, .stagger-reveal').forEach(el => {
        revealObserver.observe(el);
    });


    const recTabs = document.querySelectorAll('.rec-tab');
    const recCardsContainer = document.querySelector('.rec-cards');

    const recData = {
        popular: [
            { title: 'Minecraft', price: '$29.99', oldPrice: '$39.99', discount: '-25%', img: 'images/figama/minecraft_cardd.png' },
            { title: 'Call of duty: Black Ops', price: '$49.99', oldPrice: '$59.99', discount: '-25%', img: 'images/figama/call_of_duty_black_ops_subbanner.jpg' },
            { title: 'APEX LEGENDS', price: 'БЕСПЛАТНО', img: 'images/figama/apex_subbanner.png', isFree: true },
            { title: 'The Peak', price: '$9.99', oldPrice: '$39.99', discount: '-75%', img: 'images/figama/peak_pc.png' }
        ],
        discounts: [
            { title: 'Cyberpunk 2077', price: '$29.99', oldPrice: '$59.99', discount: '-50%', img: 'images/figama/список игр/cyberpunk.png' },
            { title: 'Ведьмак 3: Дикая Охота', price: '$14.99', oldPrice: '$49.99', discount: '-70%', img: 'images/figama/список игр/ведьмак3дикая.png' },
            { title: 'Fallout 4', price: '$9.99', oldPrice: '$19.99', discount: '-50%', img: 'images/figama/список игр/fallout.png' },
            { title: 'Baldur\'s Gate 3', price: '$49.99', oldPrice: '$59.99', discount: '-15%', img: 'images/figama/список игр/baldus.png' }
        ],
        recommended: [
            { title: 'Fortnite', price: 'БЕСПЛАТНО', img: 'images/figama/список игр/game--fortnite.png', isFree: true },
            { title: 'Rocket League', price: 'БЕСПЛАТНО', img: 'images/figama/список игр/rocket legaue.png', isFree: true },
            { title: 'Valorant', price: 'БЕСПЛАТНО', img: 'images/figama/список игр/valorant.png', isFree: true },
            { title: 'Hogwarts Legacy', price: '$59.99', img: 'images/figama/список игр/hogwarts_legacy.png' }
        ],
        nowplaying: [
            { title: 'GTA V', price: '$19.99', oldPrice: '$39.99', discount: '-50%', img: 'images/figama/список игр/gta5enh.png' },
            { title: 'Warhammer: Dark Omen', price: '$34.99', img: 'images/figama/список игр/warhamer dark omen.png' },
            { title: 'We Were Here Together', price: '$12.99', img: 'images/figama/we-were-here-together-pc-game-steam-cover.png' },
            { title: 'Need for Speed', price: '$19.99', img: 'images/figama/nfs_subbanner.jpg' }
        ]
    };

    function renderRecCards(type) {
        if (!recCardsContainer || !recData[type]) return;

        recCardsContainer.style.opacity = '0';

        setTimeout(() => {
            recCardsContainer.innerHTML = '';
            recData[type].forEach(item => {
                const card = document.createElement('div');
                card.className = 'rec-card ripple';
                card.innerHTML = `
                    <div class="rec-card-header">
                        <span>${item.title}</span>
                        <img src="icon/heart.svg" alt="Heart" class="rec-heart">
                    </div>
                    <div class="rec-card-image">
                        <img src="${item.img}" alt="${item.title}">
                    </div>
                    <div class="rec-card-footer">
                        <span class="rec-price ${item.isFree ? 'free' : ''}">${item.price}</span>
                        ${item.discount ? `<span class="rec-discount">${item.discount}</span>` : ''}
                        ${item.oldPrice ? `<span class="rec-old-price">${item.oldPrice}</span>` : ''}
                    </div>
                `;
                recCardsContainer.appendChild(card);
            });
            initHearts();
            recCardsContainer.style.opacity = '1';
        }, 300);
    }

    function initHearts() {
        document.querySelectorAll('.rec-heart, .wishlist-icon').forEach(heart => {
            heart.addEventListener('click', (e) => {
                e.stopPropagation();
                heart.classList.toggle('liked');
            });
        });
    }

    const newsMoreBtn = document.querySelector('.news-more-btn');
    const newsContainer = document.querySelector('.news-container');
    if (newsMoreBtn && newsContainer) {
        newsMoreBtn.addEventListener('click', () => {
            const isExpanded = newsContainer.classList.toggle('expanded');
            if (isExpanded) {
                newsMoreBtn.textContent = 'Свернуть';
            } else {
                newsMoreBtn.textContent = 'Развернуть';
            }
        });
    }

    recTabs.forEach(tab => {
        tab.addEventListener('click', () => {
            if (tab.classList.contains('active')) return;
            recTabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            renderRecCards(tab.dataset.tab);
        });
    });

    initHearts();

    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            const href = this.getAttribute('href');
            if (href !== '#') {
                e.preventDefault();
                const target = document.querySelector(href);
                if (target) {
                    target.scrollIntoView({
                        behavior: 'smooth'
                    });
                }
            }
        });
    });
});
