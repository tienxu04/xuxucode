// index_logic.js
const _supabase = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

// Kho chứa dữ liệu tạm để hover chạy mượt mà không delay mạng
let localItemsCache = [];
let localBooksCache = [];

document.addEventListener('DOMContentLoaded', () => {
    initShowcase();
});

async function initShowcase() {
    try {
        // Hốt trọn ổ data từ DB
        const [itemsRes, booksRes] = await Promise.all([
            _supabase.from('items').select('*').order('created_at', { ascending: false }),
            _supabase.from('books').select('*').order('vol_number', { ascending: true })
        ]);

        if (itemsRes.error) throw itemsRes.error;
        if (booksRes.error) throw booksRes.error;

        localItemsCache = itemsRes.data;
        localBooksCache = booksRes.data;

        document.getElementById('status-message').classList.add('hidden');

        // Bật các khu vực Zone lên
        document.querySelectorAll('.zone-container').forEach(el => el.classList.remove('hidden'));

        // Hàm render UI từng dòng Item
        const renderRow = (item) => `
            <div 
                class="border border-transparent border-b-gray-50 hover:border-black p-3 flex items-center justify-between cursor-pointer transition-all bg-white hover:shadow-sm group"
                onmouseenter="handleItemHover('${item.id}', '${item.name}')"
                onclick="window.location.href='item_detail.html?id=${item.id}'"
            >
                <div class="flex items-center gap-4">
                    <img src="${item.avatar_url || 'https://via.placeholder.com/150'}" class="w-10 h-10 ${item.item_type === 'author' ? 'rounded-full' : 'rounded-sm'} object-cover border border-gray-200">
                    <span class="font-bold text-sm text-gray-800 group-hover:text-black transition-colors">${item.name}</span>
                </div>
                <span class="text-gray-200 group-hover:text-black transition-transform group-hover:translate-x-1 duration-200 text-sm">→</span>
            </div>
        `;

        // Bóc tách và đổ vào 3 Zone
        const authors = localItemsCache.filter(i => i.item_type === 'author');
        const booksets = localItemsCache.filter(i => i.item_type === 'bookset');
        const collections = localItemsCache.filter(i => i.item_type === 'collection');

        document.getElementById('zone-authors').innerHTML = authors.length ? authors.map(renderRow).join('') : '<p class="text-xs italic text-gray-400 p-2">Empty.</p>';
        document.getElementById('zone-booksets').innerHTML = booksets.length ? booksets.map(renderRow).join('') : '<p class="text-xs italic text-gray-400 p-2">Empty.</p>';
        document.getElementById('zone-collections').innerHTML = collections.length ? collections.map(renderRow).join('') : '<p class="text-xs italic text-gray-400 p-2">Empty.</p>';

        // Tự động hover phần tử đầu tiên để kích hoạt mồi
        if (localItemsCache.length > 0) {
            handleItemHover(localItemsCache[0].id, localItemsCache[0].name);
        }

    } catch (err) {
        document.getElementById('status-message').innerText = `Error loading data: ${err.message}`;
        document.getElementById('status-message').classList.add('text-red-500');
    }
}

// HÀM XỬ LÝ HOVER ĐỔI SÁCH LẬP TỨC
window.handleItemHover = function(itemId, itemName) {
    const grid = document.getElementById('books-preview-grid');
    document.getElementById('preview-item-name').innerText = itemName;

    // Lọc sách theo item_id (Kiến trúc V2)
    const filteredBooks = localBooksCache.filter(book => book.item_id === itemId);

    if (filteredBooks.length === 0) {
        grid.innerHTML = `
            <div class="col-span-full flex items-center justify-center text-gray-400 italic text-xs py-16 bg-white border border-dashed fade-in-active">
                No artworks connected to this item yet.
            </div>
        `;
        return;
    }

    grid.innerHTML = filteredBooks.map(book => `
        <div class="bg-white border border-gray-100 p-2 shadow-sm relative group/book fade-in-active hover:border-black transition-colors cursor-pointer">
            <div class="aspect-[3/4] w-full overflow-hidden bg-gray-50 relative">
                <img src="${book.cover_url}" class="w-full h-full object-cover group-hover/book:scale-105 transition-transform duration-500">
                <span class="absolute top-2 left-2 bg-black text-white font-mono text-[10px] px-1.5 py-0.5 font-bold uppercase tracking-wider shadow-sm">
                    Vol.${book.vol_number}
                </span>
            </div>
            <div class="mt-3 px-1 pb-1">
                <h4 class="text-xs font-bold text-gray-900 truncate" title="${book.title}">${book.title}</h4>
            </div>
        </div>
    `).join('');
};
