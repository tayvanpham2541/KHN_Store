const productList = document.getElementById("product-list");
const searchInput = document.getElementById("user-search-input");
const searchButton = document.getElementById("user-search-button");
const loading = document.getElementById("loading");
const errorMessage = document.getElementById("error-message");
const errorDataMessage = document.getElementById("error-data-message");
const loadMoreButton = document.getElementById("load-more-button");

const featuredProductList = document.getElementById("featured-product-list");
const featuredLoading = document.getElementById("featured-loading");
const featuredError = document.getElementById("featured-error");
const featuredCarousel = document.querySelector(".featured-carousel");
const featuredPrevButton = document.getElementById("featured-prev");
const featuredNextButton = document.getElementById("featured-next");
const featuredDots = document.getElementById("featured-dots");

const productsPerPage = 9;
let currentPage = 1;
let currentSearch = "";
let hasMoreProducts = true;
let searchTimer = null;

async function getProducts(search = "", page = 1) {
    try {
        const response = await fetch(
            `/products?search=${encodeURIComponent(search)}&page=${page}&limit=${productsPerPage}`
        );
        const data = await response.json();

        if (!response.ok) {
            throw new Error(
                data.message || "Lỗi khi lấy dữ liệu từ server."
            );
        }
        return data;
    } catch (error) {
        console.error(error);
        throw error;
    }
}


function renderProducts(products, isAppend = false) {
    const html = products.map(product => `
        <div class="product-card">
            <img
                src="${product.image}"
                alt="${product.name}"
                class="product-image"
            >

            <div class="product-info">
                <h3>${product.name}</h3>

                <p>
                    Giá:
                    ${Number(product.price).toLocaleString("vi-VN")} VNĐ
                </p>

                <p class="product-description">
                    ${product.description}
                </p>

                <a
                    href="/product/${product.id}"
                    class="product-detail-button"
                >
                    Xem chi tiết
                </a>
            </div>
        </div>
    `).join("");

    if (isAppend) {
        productList.insertAdjacentHTML("beforeend", html);
    } else {
        productList.innerHTML = html;
    }
}


function updateLoadMoreUI() {
    if (hasMoreProducts) {
        loadMoreButton.classList.remove("hidden");
        loadMoreButton.disabled = false;
        loadMoreButton.textContent = "Xem thêm";
    } else {
        loadMoreButton.classList.remove("hidden");
        loadMoreButton.disabled = true;
        loadMoreButton.textContent =
            "Đã hiển thị tất cả sản phẩm";
    }
}


async function searchProducts() {

    currentSearch = searchInput.value.trim();
    currentPage = 1;
    hasMoreProducts = true;

    errorMessage.classList.add("hidden");
    errorDataMessage.classList.add("hidden");
    loading.classList.remove("hidden");
    try {
        const products = await getProducts(
            currentSearch,
            currentPage
        );
        if (products.length === 0) {
            errorMessage.textContent = "Không tìm thấy sản phẩm bạn cần tìm";
            errorMessage.classList.remove("hidden");
            productList.innerHTML = "";
            hasMoreProducts = false;
            loadMoreButton.classList.add("hidden");
        } else {
            renderProducts(products);
            hasMoreProducts = products.length === productsPerPage;
            updateLoadMoreUI();
        }
    } catch (error) {
        console.error(error);
        errorDataMessage.textContent = "❌ Không thể tải sản phẩm.";
        errorDataMessage.classList.remove("hidden");
        loadMoreButton.classList.add("hidden");
    } finally {
        loading.classList.add("hidden");
    }
}


async function loadMoreProducts() {
    if (!hasMoreProducts) {
        return;
    }
    currentPage++;
    loadMoreButton.disabled = true;
    loadMoreButton.textContent = "Đang tải...";
    try {
        const products = await getProducts(
            currentSearch,
            currentPage
        );
        if (products.length === 0) {
            hasMoreProducts = false;
            updateLoadMoreUI();
            return;
        }
        renderProducts(products, true);
        hasMoreProducts = products.length === productsPerPage;
        updateLoadMoreUI();

    } catch (error) {
        console.error(error);
        currentPage--;
        alert("❌ Không thể tải thêm sản phẩm.");
        loadMoreButton.disabled = false;
        loadMoreButton.textContent = "Xem thêm";
    }
}


// Debounce/TỰ ĐỘNG TÌM KHI NHẬP
searchInput.addEventListener("input", () => {
    clearTimeout(searchTimer);
    searchTimer = setTimeout(function () {
        searchProducts();
    }, 500);
});
// TÌM BẰNG ENTER
searchInput.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
        event.preventDefault();
        clearTimeout(searchTimer);
        searchProducts();
    }

});
// TÌM BẰNG NÚT
searchButton.addEventListener("click", () => {
    clearTimeout(searchTimer);
    searchProducts();
});

loadMoreButton.addEventListener("click", loadMoreProducts);

// KHI MỞ TRANG
// Không nhập từ khóa
// → search = ""
// → lấy tất cả sản phẩm
searchProducts();

// HIỂN THỊ SẢN PHẨM NỔI BẬT
// CAROUSEL STATE
let featuredProducts = [];
let featuredCurrentSlide = 0;
let featuredSlidesPerView = 3;
let featuredAutoSlide = null;
let featuredTouchStartX = 0;
let featuredTouchEndX = 0;

// GET SLIDES PER VIEW
function getFeaturedSlidesPerView() {
    if (window.innerWidth <= 576) {
        return 1;
    }
    if (window.innerWidth <= 992) {
        return 2;
    }
    return 3;
}

// GET TOTAL SLIDES
function getFeaturedTotalSlides() {
    return Math.max(1, Math.ceil(featuredProducts.length / featuredSlidesPerView));
}

// RENDER FEATURED PRODUCTS
function renderFeaturedProducts(products) {
    if (products.length === 0) {
        featuredProductList.innerHTML = `
            <p class="no-featured-products">
                Hiện chưa có sản phẩm nổi bật.
            </p>
        `;
        featuredCarousel.classList.add("hidden");
        featuredDots.innerHTML = "";
        return;
    }

    featuredProducts = products;
    let html = "";

    products.forEach(product => {
        html += `
            <div class="product-card featured-product-card">
                <div class="featured-badge">
                    Nổi bật
                </div>
                <img
                    src="${product.image}"
                    alt="${product.name}"
                    class="product-image"
                >
                <div class="product-info">
                    <h3>${product.name}</h3>
                    <p class="product-price">
                        ${Number(product.price).toLocaleString("vi-VN")} VNĐ
                    </p>
                    <p class="product-description">
                        ${product.description}
                    </p>
                    <a
                        href="/product/${product.id}"
                        class="product-detail-button"
                    >
                        Xem chi tiết
                    </a>
                </div>
            </div>
        `;
    });

    featuredProductList.innerHTML = html;
    featuredSlidesPerView = getFeaturedSlidesPerView();
    featuredCurrentSlide = 0;
    featuredCarousel.classList.remove("hidden");

    createFeaturedDots();
    updateFeaturedCarousel();
    startFeaturedAutoSlide();
}

// UPDATE CAROUSEL
function updateFeaturedCarousel() {
    if (featuredProducts.length === 0) {
        return;
    }

    featuredSlidesPerView = getFeaturedSlidesPerView();
    const totalSlides = getFeaturedTotalSlides();

    if (featuredCurrentSlide > totalSlides - 1) {
        featuredCurrentSlide = totalSlides - 1;
    }

    const firstCard = featuredProductList.querySelector(".featured-product-card");

    if (!firstCard) {
        return;
    }

    const cardWidth = firstCard.offsetWidth;
    const gap = parseFloat(getComputedStyle(featuredProductList).gap) || 0;
    const lastSlideStart = Math.max(0, featuredProducts.length - featuredSlidesPerView);
    const slideStart = Math.min(featuredCurrentSlide * featuredSlidesPerView, lastSlideStart);
    const translateX = slideStart * (cardWidth + gap);

    featuredProductList.style.transform = `translateX(-${translateX}px)`;

    updateFeaturedDots();
    updateFeaturedButtons();
}

// CREATE DOTS
function createFeaturedDots() {
    featuredDots.innerHTML = "";

    const totalSlides = getFeaturedTotalSlides();

    if (totalSlides <= 1) {
        featuredDots.classList.add("hidden");
        return;
    }

    featuredDots.classList.remove("hidden");

    for (let i = 0; i < totalSlides; i++) {
        const dot = document.createElement("button");

        dot.type = "button";
        dot.className = "featured-dot";
        dot.setAttribute(
            "aria-label",
            `Chuyển đến nhóm sản phẩm ${i + 1}`
        );

        dot.addEventListener("click", () => {
            featuredCurrentSlide = i;
            updateFeaturedCarousel();
            restartFeaturedAutoSlide();
        });

        featuredDots.appendChild(dot);
    }

    updateFeaturedDots();
}

// UPDATE DOTS
function updateFeaturedDots() {
    const dots = featuredDots.querySelectorAll(".featured-dot");

    dots.forEach((dot, index) => {
        dot.classList.toggle(
            "active",
            index === featuredCurrentSlide
        );
    });
}

// UPDATE BUTTONS
function updateFeaturedButtons() {
    const totalSlides = getFeaturedTotalSlides();

    if (totalSlides <= 1) {
        featuredPrevButton.classList.add("hidden");
        featuredNextButton.classList.add("hidden");
        return;
    }

    featuredPrevButton.classList.remove("hidden");
    featuredNextButton.classList.remove("hidden");

    featuredPrevButton.disabled = false;
    featuredNextButton.disabled = false;
}

// PREVIOUS
function showPreviousFeatured() {
    const totalSlides = getFeaturedTotalSlides();

    if (totalSlides <= 1) {
        return;
    }

    if (featuredCurrentSlide > 0) {
        featuredCurrentSlide--;
    } else {
        featuredCurrentSlide = totalSlides - 1;
    }

    updateFeaturedCarousel();
    restartFeaturedAutoSlide();
}

// NEXT
function showNextFeatured() {
    const totalSlides = getFeaturedTotalSlides();

    if (totalSlides <= 1) {
        return;
    }

    if (featuredCurrentSlide < totalSlides - 1) {
        featuredCurrentSlide++;
    } else {
        featuredCurrentSlide = 0;
    }

    updateFeaturedCarousel();
    restartFeaturedAutoSlide();
}

// BUTTON EVENTS
featuredPrevButton.addEventListener("click", showPreviousFeatured);
featuredNextButton.addEventListener("click", showNextFeatured);

// AUTO SLIDE
function startFeaturedAutoSlide() {
    stopFeaturedAutoSlide();

    if (featuredProducts.length <= featuredSlidesPerView) {
        return;
    }

    featuredAutoSlide = setInterval(() => {
        showNextFeatured();
    }, 5000);
}

// STOP AUTO SLIDE
function stopFeaturedAutoSlide() {
    if (featuredAutoSlide) {
        clearInterval(featuredAutoSlide);
        featuredAutoSlide = null;
    }
}

// RESTART AUTO SLIDE
function restartFeaturedAutoSlide() {
    startFeaturedAutoSlide();
}

// PAUSE WHEN HOVER
featuredCarousel.addEventListener("mouseenter", stopFeaturedAutoSlide);
featuredCarousel.addEventListener("mouseleave", startFeaturedAutoSlide);

// RESPONSIVE
window.addEventListener("resize", () => {
    const newSlidesPerView = getFeaturedSlidesPerView();

    if (newSlidesPerView !== featuredSlidesPerView) {
        featuredSlidesPerView = newSlidesPerView;
        featuredCurrentSlide = 0;
        createFeaturedDots();
    }

    updateFeaturedCarousel();
    startFeaturedAutoSlide();
});

// TOUCH / SWIPE
featuredCarousel.addEventListener(
    "touchstart",
    event => {
        featuredTouchStartX = event.touches[0].clientX;
        featuredTouchEndX = featuredTouchStartX;
        stopFeaturedAutoSlide();
    },
    { passive: true }
);

featuredCarousel.addEventListener(
    "touchmove",
    event => {
        featuredTouchEndX = event.touches[0].clientX;
    },
    { passive: true }
);

featuredCarousel.addEventListener("touchend", () => {
    const swipeDistance = featuredTouchStartX - featuredTouchEndX;
    const minimumSwipeDistance = 50;

    if (Math.abs(swipeDistance) >= minimumSwipeDistance) {
        if (swipeDistance > 0) {
            showNextFeatured();
        } else {
            showPreviousFeatured();
        }
    }

    startFeaturedAutoSlide();
});

// GET FEATURED PRODUCTS
async function getFeaturedProducts() {
    try {
        featuredLoading.classList.remove("hidden");
        featuredError.classList.add("hidden");

        const response = await fetch("/products/featured");
        const data = await response.json();

        if (!response.ok) {
            throw new Error(
                data.message || "Không thể tải sản phẩm nổi bật."
            );
        }

        renderFeaturedProducts(data);
    } catch (error) {
        console.error("Lỗi tải sản phẩm nổi bật:", error);

        featuredError.textContent = "❌ Không thể tải sản phẩm nổi bật.";
        featuredError.classList.remove("hidden");
    } finally {
        featuredLoading.classList.add("hidden");
    }
}

getFeaturedProducts();