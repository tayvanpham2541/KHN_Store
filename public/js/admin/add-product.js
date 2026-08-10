const addProductForm = document.getElementById("add-product-form");
const nameError = document.getElementById("name-error");
const priceError = document.getElementById("price-error");
const nameInput = document.getElementById("name");
const priceInput = document.getElementById("price");
const imageInput = document.getElementById("image");
const descriptionInput = document.getElementById("description");

async function getCsrfToken() {
    const response = await fetch("/csrf-token");
    const data = await response.json();
    if (!response.ok) {
        throw new Error(data.message || "Không thể lấy CSRF token");
    }
    return data.csrfToken;
}

addProductForm.addEventListener("submit", async (event) => {
    //Ngăn reload lại trang
    event.preventDefault();

    // Xóa lỗi cũ
    nameError.textContent = "";
    priceError.textContent = "";
    // Xóa trạng thái lỗi
    nameInput.classList.remove("input-error");
    priceInput.classList.remove("input-error");

    const name = nameInput.value.trim();
    const price = priceInput.value.trim();
    const image = imageInput.value.trim();
    const description = descriptionInput.value.trim();

    //Validation
    if (!name) {
        nameError.textContent = "Vui lòng nhập tên sản phẩm";
        nameInput.classList.add("input-error");
        console.log(nameInput.classList);
        return;
    }

    if (!price) {
        priceError.textContent = "Vui lòng nhập giá sản phẩm";
        priceInput.classList.add("input-error");
        return;
    }

    const priceNumber = Number(price);
    if (isNaN(priceNumber)) {
        priceError.textContent = "Giá sản phẩm phải là 1 số";
        priceInput.classList.add("input-error");
        return;
    }

    if ((priceNumber <= 0)) {
        priceError.textContent = "Giá sản phẩm phải lớn hơn 0";
        priceInput.classList.add("input-error");
        return;
    }

    const productData = {
        name,
        price: priceNumber,
        image,
        description
    };
    const csrfToken = await getCsrfToken();
    const response = await fetch("/products", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "X-CSRF-Token": csrfToken
        },
        body: JSON.stringify(productData)
    });
    const data = await response.json();
    if (!response.ok) {
        alert(data.message);
        return
    }

    alert(data.message);
    console.log(data);

    window.location.href = "/admin";
});
