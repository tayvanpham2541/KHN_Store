const addProductForm = document.getElementById("add-product-form");
const nameError = document.getElementById("name-error");
const priceError = document.getElementById("price-error");
const nameInput = document.getElementById("name");
const priceInput = document.getElementById("price");
const descriptionInput = document.getElementById("description");
const imageInput = document.getElementById("image");
const imagePreviews = document.getElementById("image-previews");
const imageError = document.getElementById("image-error");
const submitButton = document.getElementById("submit-button");
const loading = document.getElementById("loading");


async function getCsrfToken() {
    const response = await fetch("/csrf-token");
    const data = await response.json();
    if (!response.ok) {
        throw new Error(data.message || "Không thể lấy CSRF token");
    }
    return data.csrfToken;
}

// Chọn nhiều ảnh + xem trước (ảnh đầu tiên là ảnh chính)
const imagePicker = createImagePicker({
    input: imageInput,
    previewContainer: imagePreviews,
    errorElement: imageError
});


addProductForm.addEventListener("submit", async (event) => {
    // Ngăn reload lại trang
    event.preventDefault();

    // Xóa lỗi cũ
    nameError.textContent = "";
    priceError.textContent = "";
    imageError.textContent = "";

    // Xóa trạng thái lỗi
    nameInput.classList.remove("input-error");
    priceInput.classList.remove("input-error");

    const name = nameInput.value.trim();
    const price = priceInput.value.trim();
    const description = descriptionInput.value.trim();

    // Validation
    if (!name) {
        nameError.textContent = "Vui lòng nhập tên sản phẩm";
        nameInput.classList.add("input-error");
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

    if (priceNumber <= 0) {
        priceError.textContent = "Giá sản phẩm phải lớn hơn 0";
        priceInput.classList.add("input-error");
        return;
    }

    // Kiểm tra file ảnh
    if (imagePicker.getCount() === 0) {
        imageError.textContent = "Vui lòng chọn ít nhất 1 ảnh sản phẩm";
        return;
    }

    //Khóa nút khi bắt đầu click
    submitButton.disabled = true;
    submitButton.textContent = "Đang thêm...";
    loading.style.display = "block";

    // Tạo FormData
    try {
        const formData = new FormData();

        formData.append("name", name);
        formData.append("price", priceNumber);
        formData.append("description", description);
        // Gửi tất cả ảnh, ảnh đầu tiên là ảnh chính
        imagePicker.getFiles().forEach(file => {
            formData.append("images", file);
        });

        // Lấy CSRF token
        const csrfToken = await getCsrfToken();

        const response = await fetch("/products", {
            method: "POST",
            headers: {
                "X-CSRF-Token": csrfToken
            },
            body: formData
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || "Không thể thêm sản phẩm");
        }

        alert(data.message);
        console.log(data);

        window.location.href = "/admin";
    } catch (error) {
        console.error(error);
        alert(error.message || "Đã xảy ra lỗi khi thêm sản phẩm");
    } finally {
        // Nếu request thất bại → cho phép thử lại
        // Nếu thành công → trang đang chuyển hướng nên không ảnh hưởng
        submitButton.disabled = false;
        submitButton.textContent = "Thêm sản phẩm";
        loading.style.display = "none";
    }

});
