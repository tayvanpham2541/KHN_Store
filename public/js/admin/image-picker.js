// Chọn nhiều ảnh cho form thêm / sửa sản phẩm: xem trước, xóa từng ảnh, kiểm tra loại file và dung lượng.
// Dùng chung cho add-product.js và edit-product.js (phải nạp file này TRƯỚC file của trang).

// Phải khớp với MAX_PRODUCT_IMAGES trong config/constants.js (backend)
const MAX_PRODUCT_IMAGES = 6;
const MAX_IMAGE_SIZE = 5 * 1024 * 1024; // 5MB mỗi ảnh

function createImagePicker({
    input,                      // <input type="file" multiple>
    previewContainer,           // nơi hiển thị ảnh xem trước
    errorElement,               // nơi hiển thị lỗi
    maxImages = MAX_PRODUCT_IMAGES,
    getReservedCount = () => 0, // số ảnh đã có sẵn (trang sửa) tính vào giới hạn
    showMainBadge = () => true  // ảnh đầu tiên trong danh sách này có phải ảnh chính không
}) {
    // Mỗi phần tử: { file, url }
    let items = [];

    function showError(message) {
        if (errorElement) {
            errorElement.textContent = message;
        }
    }

    function fileKey(file) {
        return `${file.name}|${file.size}|${file.lastModified}`;
    }

    function render() {
        previewContainer.replaceChildren();

        items.forEach((item, index) => {
            const card = document.createElement("div");
            card.className = "preview-item";

            const image = document.createElement("img");
            image.src = item.url;
            image.alt = `Ảnh mới ${index + 1}`;

            const removeButton = document.createElement("button");
            removeButton.type = "button";
            removeButton.className = "preview-remove";
            removeButton.textContent = "×";
            removeButton.setAttribute("aria-label", `Bỏ ảnh ${item.file.name}`);
            removeButton.addEventListener("click", () => removeAt(index));

            card.append(image, removeButton);

            if (index === 0 && showMainBadge()) {
                const badge = document.createElement("span");
                badge.className = "preview-badge";
                badge.textContent = "Ảnh chính";
                card.appendChild(badge);
            }

            previewContainer.appendChild(card);
        });
    }

    function removeAt(index) {
        URL.revokeObjectURL(items[index].url);
        items.splice(index, 1);
        showError("");
        render();
    }

    input.addEventListener("change", () => {
        showError("");

        // Copy ra mảng rồi reset input để có thể chọn lại đúng file vừa bỏ
        const selectedFiles = Array.from(input.files);
        input.value = "";

        const messages = [];

        for (const file of selectedFiles) {
            if (!file.type.startsWith("image/")) {
                messages.push(`"${file.name}" không phải file ảnh`);
                continue;
            }

            if (file.size > MAX_IMAGE_SIZE) {
                messages.push(`"${file.name}" lớn hơn 5MB`);
                continue;
            }

            if (items.some(item => fileKey(item.file) === fileKey(file))) {
                continue; // đã chọn rồi
            }

            if (getReservedCount() + items.length >= maxImages) {
                messages.push(`Mỗi sản phẩm tối đa ${maxImages} ảnh`);
                break;
            }

            items.push({ file, url: URL.createObjectURL(file) });
        }

        if (messages.length > 0) {
            showError(messages.join(". "));
        }

        render();
    });

    return {
        render,
        showError,
        getFiles: () => items.map(item => item.file),
        getCount: () => items.length
    };
}
