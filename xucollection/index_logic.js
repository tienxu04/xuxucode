// index_logic.js
const _supabase = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

// ==========================================
// 1. CƠ CHẾ QUẢN LÝ THEME (GIỮ NGUYÊN MƯỢT MÀ)
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
// 2. LOGIC TRẢ VỀ NGUYÊN TÁC: HOVER HIỆN ẢNH SÁCH
// ==========================================
async function initShowcase() {
    // SỬA ĐỔI: Kéo items và kèm luôn danh sách books liên kết (Foreign Key)
    const { data: items, error } = await _supabase
        .from('items')
        .select(`
            *,
            books (*)
        `)
        .order('created_at', { ascending: false });

    if (error) {
        console.error("Lỗi kéo database:", error.message);
        return;
    }

    const zoneAuthors = document.getElementById('zone-authors');
    const zoneBooksets = document.getElementById('zone-booksets');
    const zoneCollections = document.getElementById('zone-collections');

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

    items.forEach(item => {
        // Tìm ảnh của cuốn sách đầu tiên trong tập hợp (nếu có)
        // Nếu không có cuốn nào, mới dùng tạm avatar_url làm cứu cánh
        const firstBookImg = item.books && item.books.length > 0 
            ? item.books[0].image_url 
            : item.avatar_url;

        const itemHTML = `
            <div class="group/item py-2 border-b border-[var(--border-color)]/30 hover:border-[var(--text-main)] transition-colors cursor-pointer"
                 onmouseenter="previewImage('${firstBookImg}')"
                 onclick="window.location.href='item_detail.html?id=${item.id}'">
                <div class="flex justify-between items-baseline">
                    <span class="font-bold text-base tracking-tight group-hover/item:translate-x-1 transition-transform inline-block">${item.name}</span>
                    <span class="text-[10px] font-mono uppercase opacity-40 group-hover/item:opacity-100 transition-opacity">View →</span>
                </div>
            </div>
        `;

        if (item.item_type === 'author') {
            zoneAuthors.insertAdjacentHTML('beforeend', itemHTML);
        } else if (item.item_type === 'bookset') {
            zoneBooksets.insertAdjacentHTML('beforeend', itemHTML);
        } else if (item.item_type === 'collection') {
            zoneCollections.insertAdjacentHTML('beforeend', itemHTML);
        }
    });

    // Điểm cộng tinh tế: Vừa mở trang, lấy ngay ảnh của item đầu tiên hiển thị sẵn trên sân khấu
    if (items.length > 0) {
        const defaultImg = items[0].books && items[0].books.length > 0 ? items[0].books[0].image_url : items[0].avatar_url;
        previewImage(defaultImg);
    }
}

// XỬ LÝ SÂN KHẤU HOVER ĐỔI ẢNH MƯỢT MÀ
window.previewImage = function(imgUrl) {
    const stageImg = document.getElementById('stage-showcase-img');
    if (!stageImg) return;

    if (!imgUrl || imgUrl === 'null' || imgUrl === 'undefined') {
        stageImg.classList.add('opacity-0');
        return;
    }

    stageImg.classList.add('opacity-0');
    
    setTimeout(() => {
        stageImg.src = imgUrl;
        stageImg.classList.remove('opacity-0');
    }, 150); 
};
