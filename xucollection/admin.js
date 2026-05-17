// admin_author_logic.js

// --- 1. LOGIC THÊM Ô INPUT INSTAGRAM ---
function addInstaRow() {
    const container = document.getElementById('insta-container');
    
    // Tạo div mới
    const newRow = document.createElement('div');
    newRow.className = 'flex gap-2 insta-row';
    
    // Gắn HTML: Gồm input và nút trừ (xóa)
    newRow.innerHTML = `
        <input type="text" class="flex-1 border border-gray-300 p-3 focus:outline-none focus:border-black insta-input" placeholder="Paste another link...">
        <button type="button" class="w-12 border border-red-200 text-red-500 bg-red-50 hover:bg-red-500 hover:text-white transition-colors flex items-center justify-center font-bold text-lg" onclick="removeInstaRow(this)">-</button>
    `;
    
    container.appendChild(newRow);
}

// Xóa dòng input hiện tại
function removeInstaRow(buttonElement) {
    buttonElement.parentElement.remove();
}

// --- 2. LOGIC DRAG & DROP ẢNH CHÂN DUNG ---
const dropzone = document.getElementById('avatar-dropzone');
const fileInput = document.getElementById('avatar-input');
const dropzoneContent = document.getElementById('dropzone-content');
const avatarPreview = document.getElementById('avatar-preview');

let selectedImageFile = null;

// Xử lý hiệu ứng CSS khi kéo vào
['dragenter', 'dragover'].forEach(eventName => {
    dropzone.addEventListener(eventName, (e) => {
        e.preventDefault();
        dropzone.classList.add('dropzone-active');
    });
});

['dragleave', 'drop'].forEach(eventName => {
    dropzone.addEventListener(eventName, (e) => {
        e.preventDefault();
        dropzone.classList.remove('dropzone-active');
    });
});

// Xử lý khi thả file
dropzone.addEventListener('drop', (e) => {
    const files = e.dataTransfer.files;
    if (files.length) handleImagePreview(files[0]);
});

// Hỗ trợ click để chọn file (phòng hờ không muốn kéo thả)
dropzone.addEventListener('click', () => fileInput.click());
fileInput.addEventListener('change', function() {
    if (this.files.length) handleImagePreview(this.files[0]);
});

// Hàm hiển thị Preview ảnh
function handleImagePreview(file) {
    if (!file.type.startsWith('image/')) {
        alert('Vui lòng chọn file hình ảnh!');
        return;
    }
    
    selectedImageFile = file;
    const reader = new FileReader();
    
    reader.onload = (e) => {
        avatarPreview.src = e.target.result;
        avatarPreview.classList.remove('hidden');
        dropzoneContent.classList.add('hidden'); // Ẩn cái icon đi
    };
    
    reader.readAsDataURL(file);
}

// --- 3. LOGIC GOM DỮ LIỆU ĐỂ TEST (DEBUG) ---
function debugSubmit() {
    // 1. Lấy Tên và Bio
    const name = document.getElementById('author-name').value;
    const bio = document.getElementById('author-bio').value;
    
    // 2. Gom tất cả link Instagram thành 1 mảng (Array)
    const instaInputs = document.querySelectorAll('.insta-input');
    const instaLinks = [];
    instaInputs.forEach(input => {
        if(input.value.trim() !== '') {
            instaLinks.push(input.value.trim());
        }
    });

    // 3. In ra Console để bạn debug trước khi cắm API Supabase
    console.log("=== DỮ LIỆU CHUẨN BỊ GỬI ĐI ===");
    console.log("Name:", name);
    console.log("Bio:", bio);
    console.log("Image File Ready:", selectedImageFile ? selectedImageFile.name : "None");
    console.log("Instagram Links Array:", instaLinks);
    
    alert('Bật F12 lên xem Console Log để check dữ liệu nhé!');
}