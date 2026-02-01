const API_KEY = '267ebd7340df4e6897d9a5c5e677e6a7';
const BASE_URL = 'https://api.rawg.io/api';
const NO_IMAGE = 'https://via.placeholder.com/600x400?text=No+Image+Available';

const RawgAPI = {
    async fetchGames(params = {}) {
        const queryParams = new URLSearchParams({
            key: API_KEY,
            ...params
        });

        try {
            console.log(`Fetching from RAWG: ${BASE_URL}/games?${queryParams.toString().replace(API_KEY, 'HIDDEN')}`);
            const response = await fetch(`${BASE_URL}/games?${queryParams}`);
            if (!response.ok) throw new Error(`API request failed: ${response.status}`);
            const data = await response.json();
            console.log('RAWG Data received:', data);
            return data;
        } catch (error) {
            console.error('RAWG API Error:', error);
            return null;
        }
    },

    async getGameDetails(id) {
        const queryParams = new URLSearchParams({
            key: API_KEY
        });
        try {
            const response = await fetch(`${BASE_URL}/games/${id}?${queryParams}`);
            if (!response.ok) return null;
            return await response.json();
        } catch (e) {
            return null;
        }
    },

    // Get games for the main page sidebar/carousel
    async getFeaturedGames() {
        return this.fetchGames({
            ordering: '-added',
            page_size: 6,
            metacritic: '80,100'
        });
    },

    // Get games for the recommendation tabs
    async getPopularGames() {
        return this.fetchGames({
            ordering: '-added',
            page_size: 10
        });
    },

    async getDiscountedGames() {
        // RAWG doesn't have a direct "discount" filter easily accessible via public API 
        // without more complex queries, so we'll simulate some based on random or specific ordering
        return this.fetchGames({
            ordering: '-rating',
            page_size: 10
        });
    },

    async getRecommendedGames() {
        return this.fetchGames({
            ordering: '-metacritic',
            page_size: 10
        });
    },

    async getNowPlayingGames() {
        return this.fetchGames({
            ordering: '-released',
            page_size: 10
        });
    },

    // Search games site-wide
    async searchGames(query) {
        return this.fetchGames({
            search: query,
            page_size: 10
        });
    },

    // Helper to simulate price data since RAWG API doesn't provide it
    getPriceAndDiscount(game) {
        const year = game.released ? new Date(game.released).getFullYear() : 2020;
        const rating = game.rating || 4.0;

        let basePrice = 59.99;
        if (year < 2020) basePrice = 29.99;
        if (year < 2015) basePrice = 14.99;
        if (year < 2010) basePrice = 9.99;

        // Adjust by rating
        basePrice = basePrice * (rating / 5) + (basePrice * 0.2);

        const isFree = (game.id % 7 === 0) || (rating < 3.0 && year < 2018);
        if (isFree) return { price: 0, oldPrice: 0, discount: 0, isFree: true };

        // Random discount for the "feel"
        const hasDiscount = (game.id % 3 === 0);
        const discount = hasDiscount ? (Math.floor(Math.random() * 8) + 1) * 10 : 0;
        const finalPrice = basePrice * (1 - discount / 100);
        const oldPrice = hasDiscount ? basePrice : null;

        return {
            price: finalPrice.toFixed(2),
            oldPrice: oldPrice ? oldPrice.toFixed(2) : null,
            discount: discount > 0 ? `-${discount}%` : null,
            isFree: false
        };
    }
};

window.RawgAPI = RawgAPI;
window.NO_IMAGE = NO_IMAGE;
