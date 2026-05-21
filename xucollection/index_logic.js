// index_logic.js

// ==========================================
// 1. CƠ CHẾ QUẢN LÝ THEME
// ==========================================
window.setTheme = function(themeName) {
    document.body.setAttribute('data-theme', themeName);
    localStorage.setItem('selected-theme', themeName);
};

function initTheme() {
    const savedTheme = localStorage.getItem('selected-theme') || 'cream';
    setTheme(savedTheme);
}

// ==========================================
// 2. BIẾN TOÀN CỤC & TÍCH HỢP API VERCEL
// ==========================================
let globalItems = [];
let globalBooks = [];

async function initShowcase() {
    try {
        // Gọi thẳng vào Vercel API, không đụng tới _supabase ở client
        const response = await fetch('/api/catalog');
        const data = await response.json();

        globalItems = data.items || [];
        globalBooks = data.books || [];

        const zoneAuthors = document.getElementById('zone-authors');
        const zoneBooksets = document.getElementById('zone-booksets');
        const zoneCollections = document.getElementById('zone-collections');

        if (zoneAuthors) zoneAuthors.innerHTML = '';
        if (zoneBooksets) zoneBooksets.innerHTML = '';
        if (zoneCollections) zoneCollections.innerHTML = '';

        if (globalItems.length === 0) {
            document.getElementById('loading-mask').classList.add('hidden');
            document.getElementById('showcase-content').classList.remove('hidden');
            return;
        }

        // Render giao diện theo từng loại
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
        renderStageBooks(globalItems[0].id);

        // Tắt loading mask, hiện giao diện
        document.getElementById('loading-mask').classList.add('hidden');
        document.getElementById('showcase-content').classList.remove('hidden');

    } catch (error) {
        console.error("Lỗi:", error);
        const statusMsg = document.getElementById('status-message');
        if (statusMsg) statusMsg.innerText = "Error loading archives.";
    }
}

// ==========================================
// 3. RENDER ẢNH LÊN SÂN KHẤU (Giữ nguyên logic của cậu)
// ==========================================
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

    // Hiển thị sách
    container.innerHTML = itemBooks.map(book => `
        <a href="${book.original_url || 'https://instagram.com/xuxudocsach'}" target="_blank" class="aspect-[3/4] overflow-hidden border border-[var(--border-color)] bg-[var(--bg-main)] block group transition-transform hover:scale-[1.02] duration-200">
            <img src="${book.cover_url}" alt="Book cover" class="w-full h-full object-cover opacity-90 group-hover:opacity-100 transition-opacity">
        </a>
    `).join('');
};

// Khởi chạy khi load xong trang
document.addEventListener('DOMContentLoaded', () => {
    initTheme();      
    initShowcase();   
});
