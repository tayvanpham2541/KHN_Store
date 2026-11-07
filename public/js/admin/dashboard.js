// 1. KHỞI TẠO ELEMENT & BIẾN TOÀN CỤC
const adminProductList = document.getElementById("admin-product-list");
const searchInput = document.getElementById("search-input");
const searchButton = document.getElementById("search-button");
const logoutButton = document.getElementById("logout-button");
const loading = document.getElementById("loading");
const errorMessage = document.getElementById("error-message");
const errorDataMessage = document.getElementById("error-data-message");
const loadMoreButton = document.getElementById("load-more-button");

const productsPerPage = 9;
let currentPage = 1;
let currentSearch = "";
let hasMoreProducts = true;
let searchTimer = null;

// 2. HELPER FUNCTIONS & API CALLS
// Lấy CSRF Token
async function getCsrfToken() {
  const response = await fetch("/csrf-token");
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || "Không thể lấy CSRF token");
  return data.csrfToken;
}

// Gọi API lấy danh sách sản phẩm
async function getProducts(search = "", page = 1) {
  const response = await fetch(
    `/products?search=${encodeURIComponent(search)}&page=${page}&limit=${productsPerPage}`
  );
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || "Lỗi khi lấy dữ liệu từ server.");
  return data;
}

// Hàm sinh HTML cho 1 sản phẩm (Tái sử dụng)
function createProductCardHTML(product) {
  const formattedPrice = Number(product.price).toLocaleString("vi-VN");
  const isFeatured = product.is_featured;

  return `
    <div class="admin-product" data-id="${product.id}">
      <img src="${product.image}" alt="${product.name}">
      <h3>${product.name}</h3>
      <p>${formattedPrice} VNĐ</p>
      <div class="cover-button-dbd">
        <button class="edit-product-button" data-id="${product.id}">Sửa</button>
        <button class="delete-product-button" data-id="${product.id}">Xóa</button>
      </div>

      <button class="featured-product-button ${isFeatured ? "featured-active" : ""}" data-id="${product.id}">
        ${isFeatured ? "⭐ Đang nổi bật" : "☆ Đặt nổi bật"}
      </button>
    </div>
  `;
}

// Cập nhật trạng thái hiển thị của nút Load More
function updateLoadMoreUI() {
  if (hasMoreProducts) {
    loadMoreButton.classList.remove("hidden");
    loadMoreButton.disabled = false;
    loadMoreButton.textContent = "Xem thêm";
  } else {
    loadMoreButton.classList.remove("hidden");
    loadMoreButton.disabled = true;
    loadMoreButton.textContent = "Đã hiển thị tất cả sản phẩm";
  }
}

// 3. EVENT DELEGATION (Tối ưu lắng nghe sự kiện CRUD)
// Thay vì gán từng nút, gán 1 lần duy nhất cho khung chứa danh sách
adminProductList.addEventListener("click", async (event) => {
  const target = event.target.closest("button");

  if (!target) return;

  const productId = target.dataset.id;

  if (!productId) return;

  // --- NÚT SỬA ---
  if (target.classList.contains("edit-product-button")) {
    window.location.href = `/admin/edit-product/${productId}`;
    return;
  }

  // --- NÚT XÓA ---
  if (target.classList.contains("delete-product-button")) {
    if (!confirm("Bạn có chắc chắn muốn xóa sản phẩm này?")) {
      return;
    }

    try {
      const csrfToken = await getCsrfToken();

      const response = await fetch(`/products/${productId}`, {
        method: "DELETE",
        headers: {
          "X-CSRF-Token": csrfToken,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message);
      }

      alert(data.message);

      await searchProducts();
    } catch (error) {
      console.error(error);

      alert(
        error.message ||
        "Không thể kết nối đến server"
      );
    }

    return;
  }

  // --- NÚT NỔI BẬT ---
  if (target.classList.contains("featured-product-button")) {
    try {
      target.disabled = true;
      target.textContent = "Đang cập nhật...";

      const csrfToken = await getCsrfToken();

      const response = await fetch(
        `/products/${productId}/featured`,
        {
          method: "PATCH",
          headers: {
            "X-CSRF-Token": csrfToken,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
          "Không thể cập nhật sản phẩm nổi bật"
        );
      }

      target.textContent = data.is_featured
        ? "⭐ Đang nổi bật"
        : "☆ Đặt nổi bật";

      target.classList.toggle(
        "featured-active",
        data.is_featured
      );
    } catch (error) {
      console.error(error);

      alert(
        error.message ||
        "Không thể kết nối đến server"
      );

      await searchProducts();
    } finally {
      target.disabled = false;
    }
  }
});

// 4. XỬ LÝ LỌC / TÌM KIẾM / LOAD MORE
function renderProductsList(products, isAppend = false) {
  const htmlContent = products.map(createProductCardHTML).join("");

  if (isAppend) {
    adminProductList.insertAdjacentHTML("beforeend", htmlContent);
  } else {
    adminProductList.innerHTML = htmlContent;
  }
}

async function searchProducts() {
  currentSearch = searchInput.value.trim();
  currentPage = 1;

  errorMessage.classList.add("hidden");
  errorDataMessage.classList.add("hidden");
  loading.classList.remove("hidden");

  try {
    const products = await getProducts(currentSearch, currentPage);

    if (products.length === 0) {
      errorMessage.textContent = "Không tìm thấy sản phẩm bạn cần tìm";
      errorMessage.classList.remove("hidden");
      adminProductList.innerHTML = "";
      hasMoreProducts = false;
      loadMoreButton.classList.add("hidden");
    } else {
      renderProductsList(products, false);
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
  if (!hasMoreProducts) return;

  currentPage++;
  loadMoreButton.disabled = true;
  loadMoreButton.textContent = "Đang tải...";

  try {
    const products = await getProducts(currentSearch, currentPage);

    if (products.length === 0) {
      hasMoreProducts = false;
      updateLoadMoreUI();
      return;
    }

    renderProductsList(products, true);
    hasMoreProducts = products.length === productsPerPage;
    updateLoadMoreUI();
  } catch (error) {
    console.error(error);
    currentPage--; // Trả lại page cũ nếu gọi thất bại
    alert("❌ Không thể tải thêm sản phẩm.");
    loadMoreButton.disabled = false;
    loadMoreButton.textContent = "Xem thêm";
  }
}

async function filterFeaturedProducts() {
  // 1. Reset các trạng thái dữ liệu (State)
  currentPage = 1;
  currentSearch = "";
  hasMoreProducts = false;

  // 2. Đồng bộ UI: Clear ô input tìm kiếm trên giao diện (nếu có)
  searchInput.value = "";

  // 3. Cập nhật trạng thái UI trước khi gọi API
  errorMessage.classList.add("hidden");
  errorDataMessage.classList.add("hidden");
  loading.classList.remove("hidden");
  loadMoreButton.classList.add("hidden"); // Tắt nút Load More khi lọc danh sách riêng
  adminProductList.innerHTML = ""; // Xóa danh sách cũ tránh chớp nháy (flicker) giao diện

  try {
    const response = await fetch("/products/featured");
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Không thể lấy sản phẩm nổi bật.");
    }

    // Kiểm tra trường hợp danh sách trống
    if (!data || data.length === 0) {
      errorMessage.textContent = "Hiện chưa có sản phẩm nổi bật.";
      errorMessage.classList.remove("hidden");
      return;
    }

    // Hiển thị danh sách sản phẩm
    renderProductsList(data, false);
  } catch (error) {
    console.error("Lỗi khi tải sản phẩm nổi bật:", error);
    errorDataMessage.textContent = error.message || "❌ Không thể tải sản phẩm nổi bật.";
    errorDataMessage.classList.remove("hidden");
  } finally {
    // Luôn tắt trạng thái Loading dù thành công hay thất bại
    loading.classList.add("hidden");
  }
}

// 5. EVENT LISTENERS
// Debounce Tìm kiếm
searchInput.addEventListener("input", () => {
  clearTimeout(searchTimer);
  searchTimer = setTimeout(searchProducts, 500);
});

searchInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter") {
    e.preventDefault();
    clearTimeout(searchTimer);
    searchProducts();
  }
});

searchButton.addEventListener("click", () => {
  clearTimeout(searchTimer);
  searchProducts();
});

loadMoreButton.addEventListener("click", loadMoreProducts);

logoutButton.addEventListener("click", async () => {
  try {
    const response = await fetch("/logout", { method: "POST" });
    if (response.ok) window.location.href = "/login";
  } catch (error) {
    console.error(error);
  }
});

// 6. HAMBURGER MENU & KHỞI TẠO (INIT)
function initHamburgerMenu() {
  const hamburgerButton = document.getElementById("hamburger-button");
  const sidebar = document.getElementById("sidebar");
  const sidebarOverlay = document.getElementById("sidebar-overlay");
  const sidebarClose = document.getElementById("sidebar-close");
  const sidebarLogoutButton = document.getElementById("sidebar-logout-button");

  if (!hamburgerButton || !sidebar || !sidebarOverlay || !sidebarClose) return;

  const closeSidebar = () => {
    sidebar.classList.remove("sidebar-open");
    sidebarOverlay.classList.remove("overlay-visible");
    hamburgerButton.setAttribute("aria-expanded", "false");
    document.body.classList.remove("menu-open");
  };

  hamburgerButton.addEventListener("click", () => {
    sidebar.classList.add("sidebar-open");
    sidebarOverlay.classList.add("overlay-visible");
    hamburgerButton.setAttribute("aria-expanded", "true");
    document.body.classList.add("menu-open");
  });

  sidebarClose.addEventListener("click", closeSidebar);
  sidebarOverlay.addEventListener("click", closeSidebar);

  sidebarLogoutButton?.addEventListener("click", () => logoutButton.click());

  document.querySelectorAll(".sidebar-link").forEach((link) => {
    link.addEventListener("click", (event) => {
      if (["dashboard-link", "products-link", "featured-filter-button"].includes(link.id)) {
        event.preventDefault();
      }

      document.querySelectorAll(".sidebar-link").forEach((item) => item.classList.remove("active"));
      link.classList.add("active");

      if (link.id === "products-link" || link.id === "dashboard-link") {
        searchProducts();
      } else if (link.id === "featured-filter-button") {
        filterFeaturedProducts();
      }

      if (window.innerWidth <= 768) closeSidebar();
    });
  });

  window.addEventListener("resize", () => {
    if (window.innerWidth > 768) closeSidebar();
  });
}

// Khởi chạy ứng dụng
initHamburgerMenu();
searchProducts(); // Thay thế luôn initDashboard vì logic tương đồng