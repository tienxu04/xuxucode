// admin_author_logic.js




// Khởi tạo client với biến _supabase để tránh xung đột với thư viện gốc của unpkg
const _supabase = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

// --- 1. LOGIC THÊM/XÓA Ô INPUT INSTAGRAM ---
function addInstaRow() {
    const container = document.getElementById('insta-container');
    const newRow = document.createElement('div');
    newRow.className = 'flex gap-2 insta-row';
    
    newRow.innerHTML = `
        <input type="text" class="flex-1 border border-gray-300 p-3 focus:outline-none focus:border-black insta-input" placeholder="Paste another link...">
        <button type="button" class="w-12 border border-red-200 text-red-500 bg-red-50 hover:bg-red-500 hover:text-white transition-colors flex items-center justify-center font-bold text-lg" onclick="removeInstaRow(this)">-</button>
    `;
    container.appendChild(newRow);
}

function removeInstaRow(buttonElement) {
    buttonElement.parentElement.remove();
}

// --- 2. LOGIC DRAG & DROP & PREVIEW ẢNH CHÂN DUNG ---
const dropzone = document.getElementById('avatar-dropzone');
const fileInput = document.getElementById('avatar-input');
const dropzoneContent = document.getElementById('dropzone-content');
const avatarPreview = document.getElementById('avatar-preview');

let selectedImageFile = null;

['dragenter', 'dragover'].forEach(eventName => {
    dropzone.addEventListener(eventName, (e) => { e.preventDefault(); dropzone.classList.add('dropzone-active'); });
});

['dragleave', 'drop'].forEach(eventName => {
    dropzone.addEventListener(eventName, (e) => { e.preventDefault(); dropzone.classList.remove('dropzone-active'); });
});

dropzone.addEventListener('drop', (e) => {
    const files = e.dataTransfer.files;
    if (files.length) handleImagePreview(files[0]);
});

dropzone.addEventListener('click', () => fileInput.click());
fileInput.addEventListener('change', function() {
    if (this.files.length) handleImagePreview(this.files[0]);
});

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
        dropzoneContent.classList.add('hidden');
    };
    reader.readAsDataURL(file);
}

// --- 3. LOGIC HÀM BỔ TRỢ (INSTAGRAM ID & SLUG) ---
function extractInstagramId(inputVal) {
    const trimmed = inputVal.trim();
    if (!trimmed) return null;
    
    // Bóc tách shortcode từ link đầy đủ hoặc giữ nguyên nếu bạn chỉ nhập mỗi ID
    const match = trimmed.match(/\/p\/([a-zA-Z0-9__-]+)/);
    return match ? match[1] : trimmed;
}

function generateSlug(name) {
    return name
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '') // Xóa ký tự đặc biệt
        .replace(/\s+/g, '-')         // Thay khoảng trắng thành dấu gạch ngang
        .replace(/-+/g, '-');         // Triệt tiêu các dấu gạch ngang thừa
}

// --- 4. KHÂU SUBMIT DỮ LIỆU ĐỒNG BỘ VÀO SUPABASE ---
async function debugSubmit() {
    const name = document.getElementById('author-name').value.trim();
    const bio = document.getElementById('author-bio').value.trim();
    
    if (!name) {
        alert('Vui lòng điền tên tác giả trước nhé!');
        return;
    }

    // Đổi trạng thái nút bấm để tránh bạn bấm click liên tục khi đang xử lý
    const submitBtn = document.querySelector('button[onclick="debugSubmit()"]');
    const originalBtnText = submitBtn.innerText;
    submitBtn.innerText = "PROCESSING...";
    submitBtn.disabled = true;

    try {
        let avatarUrl = null;

        // BƯỚC A: Đẩy file ảnh lên Supabase Storage (nếu bạn có kéo thả ảnh)
        if (selectedImageFile) {
            const fileExt = selectedImageFile.name.split('.').pop();
            const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
            const filePath = `${fileName}`; 

            // Đã sửa thành _supabase
            const { error: uploadError } = await _supabase.storage
                .from('avatars')
                .upload(filePath, selectedImageFile);

            if (uploadError) throw new Error(`Lỗi upload ảnh lên Storage: ${uploadError.message}`);

            // Lấy URL công khai của ảnh từ bucket
            // Đã sửa thành _supabase
            const { data: urlData } = _supabase.storage.from('avatars').getPublicUrl(filePath);
            avatarUrl = urlData.publicUrl;
        }

        // BƯỚC B: Tạo tác giả trong bảng `authors`
        const slug = generateSlug(name);
        // Đã sửa thành _supabase
        const { data: authorData, error: authorError } = await _supabase
            .from('authors')
            .insert([{ name, slug, bio, avatar_url: avatarUrl }])
            .select()
            .single();

        if (authorError) throw new Error(`Lỗi tạo bản ghi tác giả: ${authorError.message}`);
        
        const newAuthorId = authorData.id;

        // BƯỚC C: Duyệt qua các ô input Instagram để lấy ID và gom cụm insert vào bảng `books`
        const instaInputs = document.querySelectorAll('.insta-input');
        const bookInserts = [];

        instaInputs.forEach((input, index) => {
            const instaId = extractInstagramId(input.value);
            if (instaId) {
                bookInserts.push({
                    title: `Placeholder Book ${index + 1} - ${name}`, 
                    author_id: newAuthorId,
                    instagram_embed_id: instaId,
                    cover_url: `https://images.weserv.nl/?url=https://www.instagram.com/p/${instaId}/media/?size=l`,
                    vol_number: index + 1
                });
            }
        });

        // Tiến hành bulk insert nếu mảng có dữ liệu sách
        if (bookInserts.length > 0) {
            // Đã sửa thành _supabase
            const { error: booksError } = await _supabase
                .from('books')
                .insert(bookInserts);

            if (booksError) throw new Error(`Lỗi lưu danh sách sách kèm theo: ${booksError.message}`);
        }

        alert('Tuyệt vời! Đã lưu thành công thông tin tác giả và toàn bộ sách liên quan.');
        
        // Reset giao diện về trạng thái trống để sẵn sàng nhập tác giả tiếp theo
        document.getElementById('add-author-form').reset();
        avatarPreview.classList.add('hidden');
        dropzoneContent.classList.remove('hidden');
        document.getElementById('insta-container').innerHTML = `
            <div class="flex gap-2 insta-row">
                <input type="text" class="flex-1 border border-gray-300 p-3 focus:outline-none focus:border-black insta-input" placeholder="Paste Instagram post link...">
                <button type="button" class="w-12 border border-gray-300 bg-gray-50 hover:bg-black hover:text-white transition-colors flex items-center justify-center font-bold text-lg" onclick="addInstaRow()">+</button>
            </div>
        `;
        selectedImageFile = null;

    } catch (err) {
        alert(err.message);
    } finally {
        // Khôi phục lại trạng thái ban đầu của nút bấm
        submitBtn.innerText = originalBtnText;
        submitBtn.disabled = false;
    }
}
