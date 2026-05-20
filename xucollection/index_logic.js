// index_logic.js
const _supabase = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

// ==========================================
// 1. CƠ CHẾ QUẢN LÝ THEME MỚI
// ==========================================
window.setTheme = function(themeName) {
    document.body.setAttribute('data-theme', themeName);
    localStorage.setItem('selected-theme', themeName);
};

function initTheme() {
    const savedTheme = localStorage.getItem('selected-theme') || 'cream';
    setTheme(savedTheme);
}

document.addEventListener('DOMContentLoaded', () => {
    initTheme();      
    initShowcase();   
});

// ==========================================
// 2. LOGIC GỐC: HOVER SHOWCASE ALL BOOKS
// ==========================================
// Khai báo biến toàn cục để lưu trữ data sau khi kéo về
let globalItems = [];
let globalBooks = [];

async function initShowcase() {
    // Kéo dữ liệu từ 2 bảng độc lập để bypass lỗi kết nối ngầm
    const { data: items } = await _supabase.from('items').select('*').order('created_at', { ascending: false });
    const { data: books } = await _supabase.from('books').select('*');

    globalItems = items || [];
    globalBooks = books || [];

    const zoneAuthors = document.getElementById('zone-authors');
    const zoneBooksets = document.getElementById('zone-booksets');
    const zoneCollections = document.getElementById('zone-collections');

    zoneAuthors.innerHTML = '';
    zoneBooksets.innerHTML = '';
    zoneCollections.innerHTML = '';

    if (globalItems.length === 0) return;

    globalItems.forEach(item => {
        const itemHTML = `
            <div class="group/item py-2 border-b border-[var(--border-color)]/30 hover:border-[var(--text-main)] transition-colors cursor-pointer"
                 onmouseenter="renderStageBooks('${item.id}')">
                <div class="flex justify-between items-baseline">
                    <span onclick="window.location.href='item_detail.html?id=${item.id}'" class="font-bold text-base tracking-tight hover:underline group-hover/item:translate-x-1 transition-transform inline-block">
                        ${item.name}
                    </span>
                    <span class="text-[10px] font-mono uppercase opacity-40">Hover to view</span>
                </div>
            </div>
        `;

        if (item.item_type === 'author') zoneAuthors.insertAdjacentHTML('beforeend', itemHTML);
        else if (item.item_type === 'bookset') zoneBooksets.insertAdjacentHTML('beforeend', itemHTML);
        else if (item.item_type === 'collection') zoneCollections.insertAdjacentHTML('beforeend', itemHTML);
    });

    // Mới mở trang: Hiển thị sẵn toàn bộ sách của item đầu tiên
    if (globalItems.length > 0) {
        renderStageBooks(globalItems[0].id);
    }
}

// HÀM KEY POINT: HOVER VÀO LÀ RẢI TOÀN BỘ ẢNH SÁCH + LINK INSTA LÊN SÂN KHẤU
window.renderStageBooks = function(itemId) {
    const container = document.getElementById('stage-books-container');
    if (!container) return;

    // Lọc ra tất cả các cuốn sách thuộc về Item này
    const itemBooks = globalBooks.filter(book => book.item_id === itemId);

    // Nếu item này chưa có sách nào, hiển thị ảnh avatar
    if (itemBooks.length === 0) {
        const item = globalItems.find(i => i.id === itemId);
        const avatarImg = item ? item.avatar_url : '';
        container.innerHTML = `
            <div class="col-span-2 aspect-[3/4] overflow-hidden border border-[var(--border-color)]">
                <img src="${avatarImg}" class="w-full h-full object-cover">
            </div>
        `;
        return;
    }

    // ĐÃ FIX LỖI "SỐNG NHĂN": Đổi book.image_url thành book.photo_url cho chuẩn tên cột DB của sếp
    container.innerHTML = itemBooks.map(book => `
        <a href="${book.original_url || 'https://instagram.com/xuxudocsach'}" target="_blank" class="aspect-[3/4] overflow-hidden border border-[var(--border-color)] bg-[var(--bg-main)] block group transition-transform hover:scale-[1.02] duration-200">
            <img src="${book.cover_url}" alt="Book cover" class="w-full h-full object-cover opacity-90 group-hover:opacity-100 transition-opacity">
        </a>
    `).join('');
};
