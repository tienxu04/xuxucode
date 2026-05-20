// edit_item_logic.js
const _supabase = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

document.addEventListener('DOMContentLoaded', async () => {
    const { data: { user } } = await _supabase.auth.getUser();
    
    if (!user) {
        // Hiện khung login thay vì chuyển hướng
        document.getElementById('auth-gate').classList.remove('hidden');
        return;
    }
    
    // Nếu có user, cứ tiếp tục load data bình thường...
    initEditPage();
});

// Hàm login để mở cổng
window.handleLogin = async () => {
    const email = document.getElementById('login-email').value;
    const pass = document.getElementById('login-pass').value;
    
    const { error } = await _supabase.auth.signInWithPassword({ email, pass });
    
    if (error) {
        alert("Sai thông tin rồi!");
    } else {
        document.getElementById('auth-gate').classList.add('hidden'); // Ẩn khung login
        location.reload(); // Tải lại để load data
    }
};

async function loadItemData(id) {
    // Lấy thông tin Item
    const { data: item } = await _supabase.from('items').select('*').eq('id', id).single();
    // Lấy sách
    const { data: books } = await _supabase.from('books').select('*').eq('item_id', id).order('vol_number');

    document.getElementById('edit-id').value = item.id;
    document.getElementById('edit-name').value = item.name;
    document.getElementById('edit-bio').value = item.bio;

    // Hiển thị sách cũ
    const booksContainer = document.getElementById('existing-books-list');
    if (books && books.length > 0) {
        booksContainer.innerHTML = books.map(book => `
            <div class="relative group border border-gray-200">
                <img src="${book.cover_url}" class="w-full h-24 object-cover opacity-80 group-hover:opacity-40 transition-opacity">
                <span class="absolute top-1 left-1 bg-black text-white text-[9px] px-1 font-mono">VOL.${book.vol_number}</span>
                <button type="button" onclick="deleteSingleBook('${book.id}')" class="absolute inset-0 m-auto w-8 h-8 bg-red-600 text-white text-xs font-bold rounded-full opacity-0 group-hover:opacity-100 transition-opacity">X</button>
            </div>
        `).join('');
    } else {
        booksContainer.innerHTML = '<p class="text-xs text-gray-400 italic col-span-full">No books attached.</p>';
    }

    document.getElementById('loading-mask').classList.add('hidden');
    document.getElementById('edit-item-form').classList.remove('hidden');
}

// XÓA 1 CUỐN SÁCH CŨ (Action ngay)
window.deleteSingleBook = async function(bookId) {
    if(confirm("Xóa cuốn sách này?")) {
        await _supabase.from('books').delete().eq('id', bookId);
        loadItemData(document.getElementById('edit-id').value); // Reload UI
    }
}

// THÊM Ô NHẬP LINK MỚI
window.addEditInstaRow = function() {
    const container = document.getElementById('insta-container');
    const row = document.createElement('div'); row.className = 'flex gap-2 insta-row';
    row.innerHTML = `<input type="text" class="flex-1 border border-gray-300 p-3 text-sm focus:outline-none focus:border-black insta-input" placeholder="Paste another link..."><button type="button" class="w-12 border border-red-200 text-red-500 bg-red-50 hover:bg-red-500 hover:text-white font-bold text-lg" onclick="this.parentElement.remove()">-</button>`;
    container.appendChild(row);
}

// LƯU TOÀN BỘ CHỈNH SỬA
window.updateItem = async function() {
    const id = document.getElementById('edit-id').value;
    const name = document.getElementById('edit-name').value.trim();
    const bio = document.getElementById('edit-bio').value.trim();

    try {
        // 1. Cập nhật Info
        await _supabase.from('items').update({ name, bio }).eq('id', id);

        // 2. Thêm sách mới (nếu có nhập link)
        const instaInputs = document.querySelectorAll('.insta-input');
        const bookInserts = [];
        
        // Cần đếm xem hiện tại đang có bao nhiêu Vol để đánh số tiếp
        const { data: currentBooks } = await _supabase.from('books').select('vol_number').eq('item_id', id);
        let nextVol = currentBooks.length > 0 ? Math.max(...currentBooks.map(b => b.vol_number)) + 1 : 1;

        instaInputs.forEach(input => {
            const rawUrl = input.value.trim();
            const match = rawUrl.match(/\/p\/([a-zA-Z0-9__-]+)/);
            if (match) {
                bookInserts.push({
                    title: `Added Book - ${name}`,
                    item_id: id,
                    instagram_embed_id: match[1],
                    original_url: rawUrl,
                    cover_url: `https://images.weserv.nl/?url=https://www.instagram.com/p/${match[1]}/media/?size=l`,
                    vol_number: nextVol++
                });
            }
        });

        if (bookInserts.length > 0) {
            await _supabase.from('books').insert(bookInserts);
        }

        alert('Update thành công!');
        window.location.href = 'admin.html';

    } catch (err) {
        alert("Lỗi update: " + err.message);
    }
}
