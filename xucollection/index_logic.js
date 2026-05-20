// index_logic.js
const _supabase = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

// ==========================================
// 1. CƠ CHẾ QUẢN LÝ THEME (ĐẶT LÊN ĐẦU ĐỂ CHẠY NGAY)
// ==========================================
window.setTheme = function(themeName) {
    // Ốp thuộc tính data-theme vào thẻ body
    document.body.setAttribute('data-theme', themeName);
    // Lưu vào localStorage để chuyển trang không bị mất
    localStorage.setItem('selected-theme', themeName);
};

// Hàm tự động nạp theme cũ khi vừa mở trang
function initTheme() {
    const savedTheme = localStorage.getItem('selected-theme') || 'cream';
    setTheme(savedTheme);
}

// Khởi động hệ thống khi trang load xong
document.addEventListener('DOMContentLoaded', () => {
    initTheme();      // Khởi tạo màu sắc trước
    initShowcase();   // Kéo data Supabase sau
});

// ==========================================
// 2. LOGIC KÉO DATA VÀ XỬ LÝ HOVER SHOWCASE
// ==========================================
async function initShowcase() {
    // Kéo toàn bộ Items (Tác giả, Bộ sách, Bộ sưu tập)
    const { data: items, error } = await _supabase
        .from('items')
        .select('*')
        .order('created_at', { ascending: false });

    if (error) {
        console.error("Lỗi kéo database:", error.message);
        return;
    }

    // Phân loại data vào 3 Zone tương ứng trong HTML mới
    const zoneAuthors = document.getElementById('zone-authors');
    const zoneBooksets = document.getElementById('zone-booksets');
    const zoneCollections = document.getElementById('zone-collections');

    // Reset lại nội dung (Xóa chữ "Loading...")
    zoneAuthors.innerHTML = '';
    zoneBooksets.innerHTML = '';
    zoneCollections.innerHTML = '';

    if (!items || items.length === 0) {
        const noDataHTML = `<p class="text-xs italic opacity-50">Empty directory.</p>`;
        zoneAuthors.innerHTML = noDataHTML;
        zoneBooksets.innerHTML = noDataHTML;
        zoneCollections.innerHTML = noDataHTML;
        return;
    }

    // Duyệt qua từng item để render
    items.forEach(item => {
        const itemHTML = `
            <div class="group/item py-2 border-b border-[var(--border-color)]/30 hover:border-[var(--text-main)] transition-colors cursor-pointer"
                 onmouseenter="previewImage('${item.avatar_url}')"
                 onclick="window.location.href='item_detail.html?id=${item.id}'">
                <div class="flex justify-between items-baseline">
                    <span class="font-bold text-base tracking-tight group-hover/item:translate-x-1 transition-transform inline-block">${item.name}</span>
                    <span class="text-[10px] font-mono uppercase opacity-40 group-hover/item:opacity-100 transition-opacity">View →</span>
                </div>
            </div>
        `;

        // Bỏ vào đúng vị trí dựa trên item_type
        if (item.item_type === 'author') {
            zoneAuthors.insertAdjacentHTML('beforeend', itemHTML);
        } else if (item.item_type === 'bookset') {
            zoneBooksets.insertAdjacentHTML('beforeend', itemHTML);
        } else if (item.item_type === 'collection') {
            zoneCollections.insertAdjacentHTML('beforeend', itemHTML);
        }
    });
}

// XỬ LÝ SÂN KHẤU HOVER ĐỔI ẢNH MƯỢT MÀ
window.previewImage = function(imgUrl) {
    const stageImg = document.getElementById('stage-showcase-img');
    if (!stageImg) return;

    if (!imgUrl || imgUrl === 'null' || imgUrl === 'undefined') {
        stageImg.classList.add('opacity-0');
        return;
    }

    // Làm mờ ảnh cũ đi trước khi đổi nguồn ảnh mới (tránh bị giật hình)
    stageImg.classList.add('opacity-0');
    
    setTimeout(() => {
        stageImg.src = imgUrl;
        stageImg.classList.remove('opacity-0');
    }, 150); // Chờ 150ms cho hiệu ứng mượt
};
