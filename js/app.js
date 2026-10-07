/* =============================================
   WALLCRAFT — Premium Wallpaper App Logic
   Using Lorem Picsum (No API Key Required)
   ============================================= */

// --- Configuration ---
const CONFIG = {
    API_BASE: 'https://picsum.photos',
    PER_PAGE: 30,
    TOTAL_PHOTOS: 1084, // Picsum has ~1084 photos
    STYLE_FILTERS: [
        { name: 'All',        icon: 'fas fa-th',            filter: 'all',       color: '#7c3aed' },
        { name: 'Landscape',  icon: 'fas fa-desktop',       filter: 'landscape', color: '#3b82f6' },
        { name: 'Portrait',   icon: 'fas fa-mobile-alt',    filter: 'portrait',  color: '#ec4899' },
        { name: 'Grayscale',  icon: 'fas fa-adjust',        filter: 'grayscale', color: '#6b7280' },
        { name: 'Blur',       icon: 'fas fa-eye-slash',     filter: 'blur',      color: '#8b5cf6' },
        { name: 'Small',      icon: 'fas fa-compress-alt',  filter: 'small',     color: '#f59e0b' },
    ],
    // Predefined categories with curated Picsum photo IDs (manually grouped by theme)
    CATEGORIES: [
        { name: 'Nature',      icon: 'fas fa-leaf',         ids: [10,11,15,16,17,18,19,20,27,28,29,37,39,41,42,47,49,54,56,58,59,60,62,65,69,73,76,82,83,84,89,90,91,95,96,100,104,106,110,111],
          thumb: 'https://picsum.photos/id/10/400/400' },
        { name: 'Architecture',icon: 'fas fa-building',     ids: [1,3,7,36,43,44,48,50,52,53,55,57,63,69,75,84,101,116,122,134,164,174,188,204,221,238,260,263,274,283,289,290,310,326,342,348,356,365,368,392],
          thumb: 'https://picsum.photos/id/1/400/400' },
        { name: 'People',      icon: 'fas fa-users',        ids: [64,91,177,203,219,239,248,275,306,334,338,342,349,366,375,381,399,402,447,453,473,492,507,516,521,532,550,556,569,572],
          thumb: 'https://picsum.photos/id/64/400/400' },
        { name: 'Animals',     icon: 'fas fa-paw',          ids: [40,98,169,237,244,433,582,593,659,718,783,790,837,1024,1025,1062,1069,1074],
          thumb: 'https://picsum.photos/id/237/400/400' },
        { name: 'Technology',  icon: 'fas fa-laptop',       ids: [0,2,4,5,6,8,9,26,60,119,160,180,201,256,297,305,366,403,411,429,452],
          thumb: 'https://picsum.photos/id/0/400/400' },
        { name: 'Food & Drink',icon: 'fas fa-coffee',       ids: [30,75,102,112,163,225,292,312,365,425,429,431,436,488,493,504,513,755,766,824],
          thumb: 'https://picsum.photos/id/225/400/400' },
        { name: 'Travel',      icon: 'fas fa-plane',        ids: [14,22,23,24,28,29,33,35,37,38,42,46,49,51,54,56,58,61,67,70,71,73,77,78,80,82,85,87,93,96],
          thumb: 'https://picsum.photos/id/29/400/400' },
        { name: 'Abstract',    icon: 'fas fa-shapes',       ids: [55,109,130,133,135,136,137,139,141,142,143,145,146,147,149,158,161,199,213,231,253,266,281,302,313,328,333,344,370,386],
          thumb: 'https://picsum.photos/id/133/400/400' },
        { name: 'Water',       icon: 'fas fa-water',        ids: [14,16,19,20,22,45,49,54,56,59,65,69,73,82,87,90,93,96,100,105,110,148,169,188,233,239,256,269,282,303],
          thumb: 'https://picsum.photos/id/16/400/400' },
        { name: 'Mountains',   icon: 'fas fa-mountain',     ids: [10,11,15,17,27,29,37,39,41,47,54,58,62,76,83,84,89,91,95,100,104,106,110,111,114,119,121,128,131,136],
          thumb: 'https://picsum.photos/id/27/400/400' },
        { name: 'Dark Mood',   icon: 'fas fa-moon',         ids: [36,43,50,52,75,101,116,122,134,154,164,174,193,209,218,233,247,261,274,289,301,315,326,340,358,367,379,390],
          thumb: 'https://picsum.photos/id/36/400/400' },
        { name: 'Colorful',    icon: 'fas fa-palette',      ids: [21,25,30,34,53,57,63,72,74,79,81,86,88,92,94,97,99,103,107,108,112,113,115,117,118,120,123,125,126,127],
          thumb: 'https://picsum.photos/id/21/400/400' },
    ],
    SEARCH_SUGGESTIONS: [
        'Alejandro Escamilla', 'Paul Jarvis', 'Life of Pix', 'Vadim Sherbakov',
        'Ryan McGuire', 'Ales Krivec', 'Jay Mantri', 'William Hook',
        'Dustin Lee', 'Rula Sibai', 'Tina Rataj', 'Lukas Budimaier',
        'Nature', 'Architecture', 'Animals', 'Mountains', 'Water',
        'Travel', 'Technology', 'Abstract', 'Dark', 'Colorful'
    ]
};

// --- State ---
let state = {
    currentPage: 1,
    currentMode: 'curated',   // curated | category | search | favorites
    currentFilter: 'all',     // all | landscape | portrait | grayscale | blur | small
    currentCategoryIds: null,  // array of IDs for category browsing
    searchQuery: '',
    deviceType: 'desktop',
    allPhotos: [],             // master list from API
    displayPhotos: [],         // currently displayed photos
    favorites: JSON.parse(localStorage.getItem('wallcraft_favorites') || '[]'),
    isLoading: false,
    theme: localStorage.getItem('wallcraft_theme') || 'dark',
    currentPhoto: null,
    hasMore: true
};

// --- DOM Helpers ---
const $ = (sel) => document.querySelector(sel);
const $$ = (sel) => document.querySelectorAll(sel);

const dom = {
    preloader: $('#preloader'),
    navbar: $('#navbar'),
    hero: $('#hero'),
    categoriesGrid: $('#categoriesGrid'),
    masonryGrid: $('#masonryGrid'),
    loadingIndicator: $('#loadingIndicator'),
    loadMoreContainer: $('#loadMoreContainer'),
    loadMoreBtn: $('#loadMoreBtn'),
    galleryTitle: $('#galleryTitle'),
    gallerySubtitle: $('#gallerySubtitle'),
    previewModal: $('#previewModal'),
    apiKeyModal: $('#apiKeyModal'),
    searchInput: $('#searchInput'),
    heroSearchInput: $('#heroSearchInput'),
    mobileSearchInput: $('#mobileSearchInput'),
    searchSuggestions: $('#searchSuggestions'),
    deviceToggle: $('#deviceToggle'),
    favoritesBtn: $('#favoritesBtn'),
    favCount: $('#favCount'),
    themeBtn: $('#themeBtn'),
    mobileMenuBtn: $('#mobileMenuBtn'),
    mobileMenu: $('#mobileMenu'),
    mobileCatList: $('#mobileCatList'),
    favoritesSection: $('#favoritesSection'),
    favoritesGrid: $('#favoritesGrid'),
    emptyFavorites: $('#emptyFavorites'),
    toastContainer: $('#toastContainer'),
    gallerySection: $('#gallery'),
    categoriesSection: $('#categories'),
    trendingSection: $('#trending'),
};

// --- Initialize ---
document.addEventListener('DOMContentLoaded', init);

function init() {
    // Apply saved theme
    if (state.theme === 'light') {
        document.body.classList.add('light-theme');
        if (dom.themeBtn) dom.themeBtn.innerHTML = '<i class="fas fa-sun"></i>';
    }

    // No API key needed — hide the modal
    if (dom.apiKeyModal) dom.apiKeyModal.classList.remove('active');

    // Setup
    createParticles();
    renderCategories();
    setupEventListeners();
    updateFavCount();
    animateStats();
    loadInitialData();

    // Preloader
    setTimeout(() => {
        dom.preloader.classList.add('loaded');
    }, 1800);
}

// --- Particles ---
function createParticles() {
    const container = $('#particles-bg');
    if (!container) return;
    for (let i = 0; i < 30; i++) {
        const p = document.createElement('div');
        p.className = 'particle';
        p.style.left = Math.random() * 100 + '%';
        p.style.width = (Math.random() * 3 + 1) + 'px';
        p.style.height = p.style.width;
        p.style.animationDuration = (Math.random() * 20 + 15) + 's';
        p.style.animationDelay = (Math.random() * 20) + 's';
        p.style.opacity = Math.random() * 0.3 + 0.05;
        container.appendChild(p);
    }
}

// --- Stats Animation ---
function animateStats() {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                $$('.stat-number').forEach(el => {
                    const target = parseInt(el.dataset.count);
                    animateValue(el, 0, target, 1500);
                });
                observer.disconnect();
            }
        });
    });
    const el = $('.hero-stats');
    if (el) observer.observe(el);
}

function animateValue(el, start, end, duration) {
    let startTime = null;
    function step(ts) {
        if (!startTime) startTime = ts;
        const progress = Math.min((ts - startTime) / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3);
        el.textContent = Math.floor(eased * (end - start) + start);
        if (progress < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
}

// --- Categories ---
function renderCategories() {
    dom.categoriesGrid.innerHTML = CONFIG.CATEGORIES.map(cat => `
        <div class="category-card" onclick="browseCategory('${cat.name}')">
            <img src="${cat.thumb}" alt="${cat.name}" loading="lazy">
            <div class="category-info">
                <i class="${cat.icon}"></i>
                <h3>${cat.name}</h3>
                <span>${cat.ids.length}+ wallpapers</span>
            </div>
        </div>
    `).join('');

    dom.mobileCatList.innerHTML = CONFIG.CATEGORIES.map(cat => `
        <div class="mobile-cat-item" onclick="browseCategory('${cat.name}'); closeMobileMenu();">
            <i class="${cat.icon}"></i>
            <span>${cat.name}</span>
        </div>
    `).join('');
}

// --- Event Listeners ---
function setupEventListeners() {
    // Navbar scroll
    window.addEventListener('scroll', () => {
        dom.navbar.classList.toggle('scrolled', window.scrollY > 100);
    });

    // Search inputs — all three
    [dom.searchInput, dom.heroSearchInput, dom.mobileSearchInput].forEach(input => {
        if (!input) return;
        input.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                const q = input.value.trim();
                if (q) { performSearch(q); closeMobileMenu(); }
            }
        });
    });

    // Nav search suggestions
    if (dom.searchInput) {
        dom.searchInput.addEventListener('focus', showSuggestions);
        dom.searchInput.addEventListener('input', filterSuggestions);
    }
    document.addEventListener('click', (e) => {
        if (!e.target.closest('.search-wrapper')) {
            dom.searchSuggestions.classList.remove('active');
        }
    });

    // Device toggle
    dom.deviceToggle.querySelectorAll('.toggle-btn').forEach(btn => {
        btn.addEventListener('click', () => setDeviceType(btn.dataset.device));
    });

    // Mobile device toggle
    $$('.mobile-toggle-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            setDeviceType(btn.dataset.device);
            $$('.mobile-toggle-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
        });
    });

    // Favorites
    dom.favoritesBtn.addEventListener('click', toggleFavoritesView);

    // Theme
    dom.themeBtn.addEventListener('click', toggleTheme);

    // Mobile menu
    dom.mobileMenuBtn.addEventListener('click', toggleMobileMenu);

    // Filter buttons
    $$('.filter-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            $$('.filter-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            applyOrientationFilter(btn.dataset.filter);
        });
    });

    // Keyboard
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') closeModal();
        if (e.key === '/' && !e.target.closest('input')) {
            e.preventDefault();
            (dom.heroSearchInput || dom.searchInput)?.focus();
        }
    });
}

// --- Search Suggestions ---
function showSuggestions() {
    renderSuggestions(CONFIG.SEARCH_SUGGESTIONS.slice(0, 8));
    dom.searchSuggestions.classList.add('active');
}

function filterSuggestions() {
    const q = dom.searchInput.value.toLowerCase();
    if (!q) { showSuggestions(); return; }
    const filtered = CONFIG.SEARCH_SUGGESTIONS.filter(s => s.toLowerCase().includes(q));
    renderSuggestions(filtered.slice(0, 6));
}

function renderSuggestions(items) {
    dom.searchSuggestions.innerHTML = items.map(item => `
        <div class="suggestion-item" onclick="performSearch('${item.replace(/'/g, "\\'")}')">
            <i class="fas fa-search"></i>
            <span>${item}</span>
        </div>
    `).join('');
    dom.searchSuggestions.classList.toggle('active', items.length > 0);
}

// --- API Calls (Lorem Picsum — no key needed!) ---
async function fetchPhotoList(page = 1, limit = CONFIG.PER_PAGE) {
    const res = await fetch(`${CONFIG.API_BASE}/v2/list?page=${page}&limit=${limit}`);
    if (!res.ok) throw new Error(`API Error: ${res.status}`);
    return res.json();
}

async function fetchPhotoById(id) {
    const res = await fetch(`${CONFIG.API_BASE}/id/${id}/info`);
    if (!res.ok) return null;
    return res.json();
}

// Build image URL with options
function buildImageUrl(id, width, height, options = {}) {
    let url = `${CONFIG.API_BASE}/id/${id}/${width}/${height}`;
    const params = [];
    if (options.grayscale) params.push('grayscale');
    if (options.blur) params.push(`blur=${options.blur}`);
    if (params.length) url += '?' + params.join('&');
    return url;
}

// --- Data Loading ---
async function loadInitialData() {
    try {
        showLoading(true);
        // Load first batch
        const photos = await fetchPhotoList(1, CONFIG.PER_PAGE);
        state.allPhotos = photos;
        state.displayPhotos = photos;
        state.currentPage = 1;
        state.currentMode = 'curated';
        state.hasMore = photos.length >= CONFIG.PER_PAGE;
        renderWallpapers(state.displayPhotos);
        showLoading(false);
        showLoadMore(state.hasMore);
    } catch (err) {
        showLoading(false);
        showToast('Failed to load wallpapers. Please refresh.', 'error');
        console.error(err);
    }
}

async function loadMore() {
    if (state.isLoading) return;

    if (state.currentMode === 'category') {
        loadMoreCategory();
        return;
    }

    state.currentPage++;
    try {
        showLoading(true);
        dom.loadMoreContainer.classList.remove('visible');

        const photos = await fetchPhotoList(state.currentPage, CONFIG.PER_PAGE);
        state.allPhotos = [...state.allPhotos, ...photos];
        state.displayPhotos = [...state.displayPhotos, ...photos];
        state.hasMore = photos.length >= CONFIG.PER_PAGE;

        appendWallpapers(photos);
        showLoading(false);
        showLoadMore(state.hasMore);
    } catch (err) {
        showLoading(false);
        showLoadMore(true);
        showToast('Failed to load more. Try again.', 'error');
        console.error(err);
    }
}

// --- Category Browsing ---
async function browseCategory(categoryName) {
    const cat = CONFIG.CATEGORIES.find(c => c.name === categoryName);
    if (!cat) return;

    state.currentMode = 'category';
    state.currentCategoryIds = [...cat.ids];
    state.currentPage = 1;
    state.displayPhotos = [];

    // Update UI
    dom.galleryTitle.textContent = `${cat.name} Wallpapers`;
    dom.gallerySubtitle.textContent = `${cat.ids.length}+ curated ${cat.name.toLowerCase()} wallpapers`;
    dom.masonryGrid.innerHTML = '';

    // Hide hero, show gallery
    dom.hero.style.display = 'none';
    dom.categoriesSection.style.display = 'none';
    dom.trendingSection.style.display = 'none';
    dom.favoritesSection.classList.add('hidden');
    dom.gallerySection.style.display = 'block';

    window.scrollTo({ top: 0, behavior: 'smooth' });

    // Load the first batch of category photos
    await loadCategoryBatch(cat.ids.slice(0, CONFIG.PER_PAGE));
    showLoadMore(cat.ids.length > CONFIG.PER_PAGE);
}

async function loadCategoryBatch(ids) {
    showLoading(true);
    try {
        // Fetch photo info for each ID
        const promises = ids.map(id => fetchPhotoById(id));
        const results = await Promise.allSettled(promises);
        const photos = results
            .filter(r => r.status === 'fulfilled' && r.value)
            .map(r => r.value);

        state.displayPhotos = [...state.displayPhotos, ...photos];
        if (state.displayPhotos.length === photos.length) {
            renderWallpapers(state.displayPhotos);
        } else {
            appendWallpapers(photos);
        }
    } catch (err) {
        showToast('Error loading category photos.', 'error');
        console.error(err);
    }
    showLoading(false);
}

async function loadMoreCategory() {
    if (!state.currentCategoryIds) return;
    const loaded = state.displayPhotos.length;
    const nextIds = state.currentCategoryIds.slice(loaded, loaded + CONFIG.PER_PAGE);
    if (nextIds.length === 0) {
        showLoadMore(false);
        return;
    }
    dom.loadMoreContainer.classList.remove('visible');
    await loadCategoryBatch(nextIds);
    showLoadMore(loaded + nextIds.length < state.currentCategoryIds.length);
}

// --- Search ---
async function performSearch(query) {
    state.searchQuery = query.toLowerCase();
    state.currentMode = 'search';

    // Update UI
    dom.galleryTitle.textContent = `Search: "${query}"`;
    dom.gallerySubtitle.textContent = 'Searching through all available photos...';
    dom.masonryGrid.innerHTML = '';

    dom.hero.style.display = 'none';
    dom.categoriesSection.style.display = 'none';
    dom.trendingSection.style.display = 'none';
    dom.favoritesSection.classList.add('hidden');
    dom.gallerySection.style.display = 'block';

    [dom.searchInput, dom.heroSearchInput, dom.mobileSearchInput].forEach(inp => {
        if (inp) inp.value = query;
    });
    dom.searchSuggestions.classList.remove('active');

    window.scrollTo({ top: 0, behavior: 'smooth' });

    // Check if query matches a category
    const matchedCat = CONFIG.CATEGORIES.find(c => c.name.toLowerCase().includes(state.searchQuery));
    if (matchedCat) {
        state.currentMode = 'category';
        state.currentCategoryIds = [...matchedCat.ids];
        state.displayPhotos = [];
        dom.galleryTitle.textContent = `${matchedCat.name} Wallpapers`;
        dom.gallerySubtitle.textContent = `${matchedCat.ids.length}+ curated wallpapers`;
        await loadCategoryBatch(matchedCat.ids.slice(0, CONFIG.PER_PAGE));
        showLoadMore(matchedCat.ids.length > CONFIG.PER_PAGE);
        return;
    }

    // Search by photographer name across multiple pages
    showLoading(true);
    try {
        let allResults = [];
        // Load up to 5 pages to find matches
        for (let page = 1; page <= 5; page++) {
            const photos = await fetchPhotoList(page, 100);
            if (photos.length === 0) break;
            const matches = photos.filter(p =>
                p.author.toLowerCase().includes(state.searchQuery) ||
                (p.url && p.url.toLowerCase().includes(state.searchQuery))
            );
            allResults = [...allResults, ...matches];
            if (allResults.length >= 30 || photos.length < 100) break;
        }

        state.displayPhotos = allResults;
        dom.gallerySubtitle.textContent = `Found ${allResults.length} wallpapers`;
        renderWallpapers(state.displayPhotos);
        showLoadMore(false);

        if (allResults.length === 0) {
            showToast('No matches found. Try a photographer name or browse categories.', 'info');
        }
    } catch (err) {
        showToast('Search failed. Please try again.', 'error');
        console.error(err);
    }
    showLoading(false);
}

// --- Rendering ---
function renderWallpapers(photos) {
    dom.masonryGrid.innerHTML = photos.map((photo, i) => createWallCard(photo, i)).join('');
}

function appendWallpapers(photos) {
    const html = photos.map((photo, i) => createWallCard(photo, i)).join('');
    dom.masonryGrid.insertAdjacentHTML('beforeend', html);
}

function createWallCard(photo, index) {
    const isFav = state.favorites.some(f => f.id === photo.id);
    const isGrayscale = state.currentFilter === 'grayscale';
    const blurVal = state.currentFilter === 'blur' ? 2 : 0;

    // Determine thumbnail size based on device type
    let thumbW, thumbH;
    if (state.deviceType === 'mobile') {
        thumbW = 400;
        thumbH = Math.round(400 * (photo.height / photo.width));
        // Force portrait-ish
        if (thumbH < thumbW) { thumbH = Math.round(thumbW * 1.5); }
    } else {
        thumbW = 600;
        thumbH = Math.round(600 * (photo.height / photo.width));
    }

    const thumbSrc = buildImageUrl(photo.id, thumbW, thumbH, {
        grayscale: isGrayscale,
        blur: blurVal || undefined
    });

    const res = `${photo.width}×${photo.height}`;

    return `
        <div class="wall-card" data-id="${photo.id}" data-w="${photo.width}" data-h="${photo.height}" 
             style="animation-delay: ${(index % 8) * 0.05}s">
            <img src="${thumbSrc}" alt="Photo by ${photo.author}" loading="lazy"
                 style="aspect-ratio: ${thumbW}/${thumbH}; background: #1a1a2e;">
            <div class="card-overlay" onclick="openPreview('${photo.id}')">
                <div class="card-top-actions">
                    <button class="card-action-btn ${isFav ? 'favorited' : ''}"
                            onclick="event.stopPropagation(); toggleFavorite('${photo.id}')"
                            title="${isFav ? 'Remove from favorites' : 'Add to favorites'}">
                        <i class="fa${isFav ? 's' : 'r'} fa-heart"></i>
                    </button>
                    <button class="card-action-btn"
                            onclick="event.stopPropagation(); quickDownload('${photo.id}')"
                            title="Download">
                        <i class="fas fa-download"></i>
                    </button>
                </div>
                <div class="card-bottom-info">
                    <div class="card-photographer">
                        <i class="fas fa-camera"></i>
                        <span>${photo.author}</span>
                    </div>
                    <span class="card-resolution">${res}</span>
                </div>
            </div>
        </div>
    `;
}

// --- Orientation Filter ---
function applyOrientationFilter(filter) {
    const cards = dom.masonryGrid.querySelectorAll('.wall-card');
    cards.forEach(card => {
        const w = parseInt(card.dataset.w);
        const h = parseInt(card.dataset.h);
        if (filter === 'all') card.style.display = '';
        else if (filter === 'landscape' && w > h) card.style.display = '';
        else if (filter === 'portrait' && h > w) card.style.display = '';
        else if (filter === 'landscape' && w <= h) card.style.display = 'none';
        else if (filter === 'portrait' && h <= w) card.style.display = 'none';
    });
}

// --- Preview Modal ---
function openPreview(photoId) {
    const photo = findPhoto(photoId);
    if (!photo) return;
    state.currentPhoto = photo;

    const modalImg = $('#modalImage');
    modalImg.classList.remove('loaded');

    // Large preview
    const previewUrl = buildImageUrl(photo.id, Math.min(photo.width, 1920), Math.min(photo.height, 1280), {
        grayscale: state.currentFilter === 'grayscale'
    });
    modalImg.src = previewUrl;
    modalImg.onload = () => modalImg.classList.add('loaded');

    // Info
    $('#photographerName').textContent = photo.author;
    $('#photographerLink').href = photo.url || `https://unsplash.com`;
    $('#wallpaperRes').textContent = `${photo.width} × ${photo.height}`;
    $('#wallpaperColor').textContent = '#1a1a2e';
    $('#colorPreview').style.background = '#1a1a2e';

    // Download options
    const downloads = [
        { label: 'Original',    size: `${photo.width}×${photo.height}`, url: photo.download_url },
        { label: 'Desktop QHD', size: '2560×1440',  url: buildImageUrl(photo.id, 2560, 1440) },
        { label: 'Desktop FHD', size: '1920×1080',  url: buildImageUrl(photo.id, 1920, 1080) },
        { label: 'Desktop HD',  size: '1280×720',   url: buildImageUrl(photo.id, 1280, 720) },
        { label: 'Mobile',      size: '1080×1920',  url: buildImageUrl(photo.id, 1080, 1920) },
        { label: 'Mobile HD',   size: '720×1280',   url: buildImageUrl(photo.id, 720, 1280) },
        { label: 'Tablet',      size: '2048×2732',  url: buildImageUrl(photo.id, 2048, 2732) },
        { label: 'Square',      size: '1080×1080',  url: buildImageUrl(photo.id, 1080, 1080) },
    ];

    $('#downloadOptions').innerHTML = downloads.map(d => `
        <a class="download-btn" href="${d.url}" download target="_blank"
           onclick="showToast('Download started!', 'success')">
            <span class="dl-label">
                <i class="fas fa-download"></i>
                ${d.label}
            </span>
            <span class="dl-size">${d.size}</span>
        </a>
    `).join('');

    // Favorite state
    const isFav = state.favorites.some(f => f.id === photo.id);
    const favBtn = $('#modalFavBtn');
    favBtn.className = `action-btn favorite-action ${isFav ? 'favorited' : ''}`;
    favBtn.innerHTML = `
        <i class="fa${isFav ? 's' : 'r'} fa-heart"></i>
        <span>${isFav ? 'Remove from Favorites' : 'Add to Favorites'}</span>
    `;

    dom.previewModal.classList.add('active');
    document.body.style.overflow = 'hidden';
}

function closeModal() {
    dom.previewModal.classList.remove('active');
    document.body.style.overflow = '';
}

// --- Favorites ---
function findPhoto(photoId) {
    return state.displayPhotos.find(p => p.id == photoId) ||
           state.allPhotos.find(p => p.id == photoId) ||
           state.favorites.find(f => f.id == photoId);
}

function toggleFavorite(photoId) {
    const photo = findPhoto(photoId);
    if (!photo) return;

    const idx = state.favorites.findIndex(f => f.id == photoId);
    if (idx > -1) {
        state.favorites.splice(idx, 1);
        showToast('Removed from favorites', 'info');
    } else {
        state.favorites.push(photo);
        showToast('Added to favorites ❤️', 'success');
    }

    localStorage.setItem('wallcraft_favorites', JSON.stringify(state.favorites));
    updateFavCount();
    refreshCardFavStates();
}

function toggleFavoriteModal() {
    if (!state.currentPhoto) return;
    toggleFavorite(state.currentPhoto.id);

    const isFav = state.favorites.some(f => f.id == state.currentPhoto.id);
    const favBtn = $('#modalFavBtn');
    favBtn.className = `action-btn favorite-action ${isFav ? 'favorited' : ''}`;
    favBtn.innerHTML = `
        <i class="fa${isFav ? 's' : 'r'} fa-heart"></i>
        <span>${isFav ? 'Remove from Favorites' : 'Add to Favorites'}</span>
    `;
}

function updateFavCount() {
    const count = state.favorites.length;
    dom.favCount.textContent = count;
    dom.favCount.classList.toggle('visible', count > 0);
}

function refreshCardFavStates() {
    dom.masonryGrid.querySelectorAll('.wall-card').forEach(card => {
        const id = card.dataset.id;
        const isFav = state.favorites.some(f => f.id == id);
        const btn = card.querySelector('.card-action-btn');
        if (btn) {
            btn.className = `card-action-btn ${isFav ? 'favorited' : ''}`;
            btn.querySelector('i').className = `fa${isFav ? 's' : 'r'} fa-heart`;
        }
    });
}

function toggleFavoritesView() {
    const showing = !dom.favoritesSection.classList.contains('hidden');
    if (showing) {
        goHome();
    } else {
        dom.hero.style.display = 'none';
        dom.categoriesSection.style.display = 'none';
        dom.trendingSection.style.display = 'none';
        dom.gallerySection.style.display = 'none';
        dom.favoritesSection.classList.remove('hidden');

        if (state.favorites.length === 0) {
            dom.favoritesGrid.innerHTML = '';
            dom.emptyFavorites.classList.add('visible');
        } else {
            dom.emptyFavorites.classList.remove('visible');
            dom.favoritesGrid.innerHTML = state.favorites.map((photo, i) => createWallCard(photo, i)).join('');
        }
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }
}

// --- Quick Download ---
function quickDownload(photoId) {
    const photo = findPhoto(photoId);
    if (!photo) return;

    let url;
    if (state.deviceType === 'mobile') {
        url = buildImageUrl(photo.id, 1080, 1920);
    } else {
        url = buildImageUrl(photo.id, 1920, 1080);
    }
    window.open(url, '_blank');
    showToast('Download started!', 'success');
}

// --- Device Type ---
function setDeviceType(type) {
    state.deviceType = type;

    dom.deviceToggle.querySelectorAll('.toggle-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.device === type);
    });
    dom.deviceToggle.querySelector('.toggle-slider').classList.toggle('mobile', type === 'mobile');

    // Re-render current view
    renderWallpapers(state.displayPhotos);
    showToast(`Switched to ${type} wallpapers`, 'info');
}

// --- Theme ---
function toggleTheme() {
    const isLight = document.body.classList.toggle('light-theme');
    state.theme = isLight ? 'light' : 'dark';
    localStorage.setItem('wallcraft_theme', state.theme);
    dom.themeBtn.innerHTML = `<i class="fas fa-${isLight ? 'sun' : 'moon'}"></i>`;
}

// --- Mobile Menu ---
function toggleMobileMenu() {
    dom.mobileMenuBtn.classList.toggle('active');
    dom.mobileMenu.classList.toggle('active');
}

function closeMobileMenu() {
    dom.mobileMenuBtn.classList.remove('active');
    dom.mobileMenu.classList.remove('active');
}

// --- Navigation ---
function goHome() {
    dom.hero.style.display = '';
    dom.categoriesSection.style.display = '';
    dom.trendingSection.style.display = '';
    dom.gallerySection.style.display = '';
    dom.favoritesSection.classList.add('hidden');

    state.currentMode = 'curated';
    state.currentFilter = 'all';
    dom.galleryTitle.textContent = 'Curated Collection';
    dom.gallerySubtitle.textContent = 'Handpicked high-quality wallpapers';

    [dom.searchInput, dom.heroSearchInput, dom.mobileSearchInput].forEach(inp => {
        if (inp) inp.value = '';
    });

    loadInitialData();
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function heroSearch() {
    const q = dom.heroSearchInput.value.trim();
    if (q) performSearch(q);
}

// Kept for backward compat with HTML onclick
function searchWallpapers(query) {
    performSearch(query);
}

// --- API Key (no-op, kept for HTML compat) ---
function saveApiKey() {
    if (dom.apiKeyModal) dom.apiKeyModal.classList.remove('active');
    showToast('No API key needed! Enjoy free wallpapers.', 'success');
}

// --- UI Helpers ---
function showLoading(show) {
    state.isLoading = show;
    dom.loadingIndicator.classList.toggle('active', show);
}

function showLoadMore(show) {
    dom.loadMoreContainer.classList.toggle('visible', show);
}

function showToast(message, type = 'info') {
    const icons = { success: 'fa-check-circle', error: 'fa-exclamation-circle', info: 'fa-info-circle' };
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.innerHTML = `<i class="fas ${icons[type]}"></i><span>${message}</span>`;
    dom.toastContainer.appendChild(toast);
    setTimeout(() => {
        toast.classList.add('fade-out');
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}
