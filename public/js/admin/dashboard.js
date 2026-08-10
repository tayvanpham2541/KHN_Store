const adminProductList = document.getElementById("admin-product-list");
const searchInput = document.getElementById("search-input");
const searchButton = document.getElementById("search-button");
const logoutButton = document.getElementById("logout-button");
const loading = document.getElementById("loading");
const errorMessage = document.getElementById("error-message");
const errorDataMessage = document.getElementById("error-data-message");

//GET PRODUCT
async function getProducts(search = "") {
  try {
    const response = await fetch(
      `/products?search=${encodeURIComponent(search)}`,
    );
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Lỗi khi lấy dữ liệu từ server.");
    }
    return data;
  } catch (error) {
    console.error(error);
    throw error;
  }
}

async function searchProducts() {
  const keyword = searchInput.value.trim();
  //Ẩn lỗi cũ
  errorDataMessage.classList.add("hidden");
  errorMessage.classList.add("hidden");
  //Hiện loading
  loading.classList.remove("hidden");
  try {
    const products = await getProducts(keyword);
    if (products.length === 0) {
      errorMessage.textContent = `Không tìm thấy sản phẩm bạn cần tìm`;
      errorMessage.classList.remove("hidden");
      //Xóa danh sách sản phẩm
      adminProductList.innerHTML = "";
    } else {
      refreshProductList(products);
    }
  } catch (error) {
    console.error(error);
    errorDataMessage.textContent = "❌ Không thể tải sản phẩm.";
    errorDataMessage.classList.remove("hidden");
  } finally {
    loading.classList.add("hidden");
  }
}

//Tìm bằng INPUT
let timer;
searchInput.addEventListener("input", function () {
  clearTimeout(timer);
  timer = setTimeout(function () {
    searchProducts();
  }, 500);
});

// Tìm bằng ENTER
searchInput.addEventListener("keydown", (event) => {
  if (event.key === "Enter") {
    //Tranh load lại trang dùng khi có form
    event.preventDefault();
    clearTimeout(timer);
    searchProducts();
  }
});
//Tìm bằng nút tìm kiếm click
searchButton.addEventListener("click", () => {
  clearTimeout(timer);
  searchProducts();
});

///Render dữ liệu-Sửa dữ liệu-Xóa dữ liệu
function refreshProductList(products) {
  renderProducts(products);
  handleEditButtons();
  handleDeleteButtons();
}

//Render Products
function renderProducts(products) {
  let html = "";
  products.forEach((product) => {
    html += `
                    <div class="admin-product">
                        <img
                            src="/images/${product.image}"
                            alt="${product.name}"
                        >
                        <h3> ${product.name} </h3>
                        <p> ${Number(product.price).toLocaleString("vi-VN")} VNĐ </p>
                        <button class="edit-product-button" data-id="${product.id}"> Sửa </button>
                        <button class="delete-product-button" data-id="${product.id}"> Xóa </button>
                    </div>
                `;
  });
  adminProductList.innerHTML = html;
}

function handleEditButtons() {
  //Tìm tất cả phần tử classs = edit-product-button
  const editButtons = document.querySelectorAll(".edit-product-button");
  editButtons.forEach((button) => {
    button.addEventListener("click", () => {
      //Lấy ID sản phẩm
      const id = button.dataset.id;
      //Chuyển sang trang edit
      window.location.href = `/admin/edit-product/${id}`;
    });
  });
}

async function getCsrfToken() {
    const response = await fetch("/csrf-token");

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.message || "Không thể lấy CSRF token");
    }

    return data.csrfToken;
}

function handleDeleteButtons() {
  const deleteButtons = document.querySelectorAll(".delete-product-button");
  deleteButtons.forEach((button) => {
    button.addEventListener("click", async () => {
      try {
        const id = button.dataset.id;
        const confirmed = confirm("Bạn có chắc chắn muốn xóa sản phẩm này");
        if (!confirmed) {
          return;
        }

        const csrfToken = await getCsrfToken();
        const response = await fetch(`/products/${id}`, {
          method: "DELETE",
          headers:{
            "X-CSRF-Token": csrfToken
          }
        });

        const data = await response.json();
        //Kiểm tra lỗi
        if (!response.ok) {
          throw new Error(data.message);
        }
        // Thông báo thành công
        alert(data.message);

        // Tải lại danh sách
        await searchProducts();
      } catch (error) {
        console.error(error);
        alert(error.message || "Không thể kết nối đến server");
      }
    });
  });
}

async function initDashboard() {
  loading.classList.remove("hidden");
  try {
    //Lấy dữ liệu
    const data = await getProducts();
    //Render dữ liệu
    //Sửa dữ liệu
    //Xóa dữ liệu
    refreshProductList(data);
  } catch (error) {
    errorDataMessage.textContent = "❌ Không thể tải sản phẩm.";
    errorDataMessage.classList.remove("hidden");
  } finally {
    loading.classList.add("hidden");
  }
}

logoutButton.addEventListener("click", async () => {
  try {
    const response = await fetch("/logout", {
      method: "POST"
    })
    if (response.ok) {
      const data = await response.json();
      console.log(data.message);
      window.location.href = "/login";
    }
  } catch (error) {
    console.error(error);
  }
})

initDashboard();
