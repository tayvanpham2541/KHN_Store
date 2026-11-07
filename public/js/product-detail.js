const productContent = document.getElementById("product-content");
const loading = document.getElementById("loading");
const errorMessage = document.getElementById("error-message");


// Lấy ID sản phẩm từ URL
const pathParts = window.location.pathname.split("/");
const productId = pathParts[pathParts.length - 1];


// Chống chèn HTML khi hiển thị dữ liệu từ server
function escapeHtml(value) {
    return String(value ?? "").replace(/[&<>"']/g, (char) => ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;"
    }[char]));
}


// Lấy thông tin sản phẩm
async function getProduct() {
    try {
        const response = await fetch(`/products/${productId}`);

        const data = await response.json();

        if (!response.ok) {
            throw new Error(
                data.message || "Không thể tải sản phẩm."
            );
        }

        return data;

    } catch (error) {
        console.error(error);
        throw error;
    }
}


// Danh sách link ảnh của sản phẩm (ảnh đầu tiên là ảnh chính)
function getProductImages(product) {
    const images = Array.isArray(product.images)
        ? product.images.map((image) => image.image_url).filter(Boolean)
        : [];

    // Sản phẩm cũ chưa có bảng ảnh: dùng ảnh chính
    if (images.length === 0 && product.image) {
        images.push(product.image);
    }

    return images;
}


// Tạo thư viện ảnh: ảnh lớn + ảnh nhỏ bên dưới, nút trước/sau, vuốt, phím mũi tên
function createGallery(images, productName) {
    const gallery = document.createElement("div");
    gallery.className = "product-gallery";

    if (images.length === 0) {
        const empty = document.createElement("div");
        empty.className = "gallery-empty";
        empty.textContent = "Chưa có hình ảnh";
        gallery.appendChild(empty);
        return gallery;
    }

    let current = 0;

    const stage = document.createElement("div");
    stage.className = "gallery-stage";

    const mainImage = document.createElement("img");
    mainImage.className = "gallery-main-image";
    stage.appendChild(mainImage);

    gallery.appendChild(stage);

    // Chỉ 1 ảnh: không cần nút, ảnh nhỏ, bộ đếm
    if (images.length === 1) {
        mainImage.src = images[0];
        mainImage.alt = productName;
        return gallery;
    }

    const previousButton = document.createElement("button");
    previousButton.type = "button";
    previousButton.className = "gallery-nav gallery-prev";
    previousButton.textContent = "‹";
    previousButton.setAttribute("aria-label", "Ảnh trước");

    const nextButton = document.createElement("button");
    nextButton.type = "button";
    nextButton.className = "gallery-nav gallery-next";
    nextButton.textContent = "›";
    nextButton.setAttribute("aria-label", "Ảnh tiếp theo");

    const counter = document.createElement("span");
    counter.className = "gallery-counter";

    stage.append(previousButton, nextButton, counter);

    const thumbList = document.createElement("div");
    thumbList.className = "gallery-thumbs";

    const thumbButtons = images.map((url, index) => {
        const button = document.createElement("button");
        button.type = "button";
        button.className = "gallery-thumb";
        button.setAttribute("aria-label", `Xem ảnh ${index + 1}`);

        const thumb = document.createElement("img");
        thumb.src = url;
        thumb.alt = "";
        thumb.loading = "lazy";

        button.appendChild(thumb);
        button.addEventListener("click", () => showImage(index));
        thumbList.appendChild(button);

        return button;
    });

    gallery.appendChild(thumbList);

    function showImage(index) {
        // Đi vòng: ảnh cuối -> ảnh đầu và ngược lại
        current = (index + images.length) % images.length;

        mainImage.src = images[current];
        mainImage.alt = `${productName} - ảnh ${current + 1}`;
        counter.textContent = `${current + 1} / ${images.length}`;

        thumbButtons.forEach((button, i) => {
            button.classList.toggle("active", i === current);
            button.setAttribute("aria-current", i === current ? "true" : "false");
        });

        // Cuộn dải ảnh nhỏ để ảnh đang xem nằm giữa (chỉ cuộn ngang trong dải ảnh)
        const activeThumb = thumbButtons[current];
        thumbList.scrollTo({
            left: activeThumb.offsetLeft - (thumbList.clientWidth - activeThumb.clientWidth) / 2,
            behavior: "smooth"
        });
    }

    previousButton.addEventListener("click", () => showImage(current - 1));
    nextButton.addEventListener("click", () => showImage(current + 1));

    // Phím mũi tên trái / phải
    document.addEventListener("keydown", (event) => {
        if (event.key === "ArrowLeft") {
            showImage(current - 1);
        } else if (event.key === "ArrowRight") {
            showImage(current + 1);
        }
    });

    // Vuốt trái / phải trên điện thoại
    let touchStartX = 0;

    stage.addEventListener("touchstart", (event) => {
        touchStartX = event.touches[0].clientX;
    }, { passive: true });

    stage.addEventListener("touchend", (event) => {
        const distance = touchStartX - event.changedTouches[0].clientX;

        if (Math.abs(distance) >= 50) {
            showImage(distance > 0 ? current + 1 : current - 1);
        }
    }, { passive: true });

    showImage(0);

    return gallery;
}


// Hiển thị sản phẩm
function renderProduct(product) {

    productContent.innerHTML = `
        <div class="product-detail-card">

            <div id="product-gallery-slot"></div>

            <div class="product-detail-info">

                <h1>Tên sản phẩm: ${escapeHtml(product.name)}</h1>

                <p class="product-detail-price"> Giá:
                    ${Number(product.price).toLocaleString("vi-VN")} VNĐ
                </p>

                <div class="product-detail-description">
                    <h2>Mô tả sản phẩm</h2>

                    <p>${escapeHtml(product.description)}</p>
                </div>

                <a href="/" class="back-button">
                    ← Quay lại sản phẩm
                </a>

            </div>

        </div>
    `;

    document
        .getElementById("product-gallery-slot")
        .replaceWith(createGallery(getProductImages(product), product.name));
}


// Khởi tạo
async function initProductDetail() {

    try {

        const product = await getProduct();

        renderProduct(product);

    } catch (error) {

        errorMessage.textContent =
            "❌ Không thể tải thông tin sản phẩm.";

    } finally {

        loading.style.display = "none";

    }
}


initProductDetail();
