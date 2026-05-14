/* admin.js */
const SUPABASE_URL = 'https://enbghqraldttcqdzzhdx.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVuYmdocXJhbGR0dGNxZHp6aGR4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzg2NzEwNDIsImV4cCI6MjA5NDI0NzA0Mn0.AiwKt87lu47bWLRUoRi4wzO0TFMoo6AY6TLhlH-_bXM';

const supabase = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

let currentAuthorId = null;

// Khởi tạo khi load trang
document.addEventListener('DOMContentLoaded', () => {
    fetchAuthors();
    setupDragAndDrop();
});

// --- AUTHOR ACTIONS ---

window.prepareNewAuthor = function() {
    currentAuthorId = null;
    document.getElementById('author-form').reset();
    document.getElementById('author-id').value = '';
    document.getElementById('form-title').innerText = 'New Author';
    document.getElementById('dropzone').style.backgroundImage = 'none';
    document.getElementById('books-section').classList.add('hidden');
};

window.fetchAuthors = async function() {
    const { data, error } = await supabase.from('authors').select('*').order('name');
    if (error) return console.error(error);
    
    const list = document.getElementById('authors-list');
    list.innerHTML = data.map(author => `
        <div class="p-3 hover:bg-gray-100 cursor-pointer flex justify-between group border-bottom" onclick="selectAuthor('${author.id}')">
            <span>${author.name}</span>
            <button class="text-red-400 opacity-0 group-hover:opacity-100" onclick="deleteAuthor(event, '${author.id}', '${author.name}')">✕</button>
        </div>
    `).join('');
};

window.selectAuthor = async function(id) {
    currentAuthorId = id;
    const { data } = await supabase.from('authors').select('*').eq('id', id).single();
    
    document.getElementById('author-id').value = data.id;
    document.getElementById('author-name').value = data.name;
    document.getElementById('author-slug').value = data.slug;
    document.getElementById('author-bio').value = data.bio;
    document.getElementById('author-avatar-url').value = data.avatar_url;
    document.getElementById('dropzone').style.backgroundImage = `url(${data.avatar_url})`;
    document.getElementById('form-title').innerText = 'Edit Author';
    
    document.getElementById('books-section').classList.remove('hidden');
    fetchBooks(id);
};

window.saveAuthor = async function() {
    const id = document.getElementById('author-id').value;
    const payload = {
        name: document.getElementById('author-name').value,
        slug: document.getElementById('author-slug').value,
        bio: document.getElementById('author-bio').value,
        avatar_url: document.getElementById('author-avatar-url').value
    };

    const { error } = id 
        ? await supabase.from('authors').update(payload).eq('id', id)
        : await supabase.from('authors').insert([payload]);

    if (error) alert(error.message);
    else {
        alert("Saved!");
        fetchAuthors();
    }
};

window.deleteAuthor = async function(e, id, name) {
    e.stopPropagation();
    if (!confirm(`Xóa ${name}? Tất cả sách của họ sẽ mất.`)) return;
    await supabase.from('authors').delete().eq('id', id);
    fetchAuthors();
    prepareNewAuthor();
};

// --- DRAG & DROP LOGIC ---

function setupDragAndDrop() {
    const dropzone = document.getElementById('dropzone');
    
    ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(name => {
        dropzone.addEventListener(name, e => { e.preventDefault(); e.stopPropagation(); });
    });

    dropzone.addEventListener('drop', async (e) => {
        const file = e.dataTransfer.files[0];
        if (!file) return;
        
        const fileExt = file.name.split('.').pop();
        const fileName = `${Math.random()}.${fileExt}`;
        const filePath = `avatars/${fileName}`;

        const { error: uploadError } = await supabase.storage
            .from('avatars')
            .upload(filePath, file);

        if (uploadError) return alert(uploadError.message);

        const { data } = supabase.storage.from('avatars').getPublicUrl(filePath);
        document.getElementById('author-avatar-url').value = data.publicUrl;
        dropzone.style.backgroundImage = `url(${data.publicUrl})`;
        dropzone.innerHTML = '';
    });
}

// --- BOOK ACTIONS ---

window.addBook = async function() {
    const instaId = document.getElementById('insta-id').value;
    const title = document.getElementById('book-title').value;
    if (!instaId || !currentAuthorId) return;

    const { error } = await supabase.from('books').insert([{
        title: title,
        instagram_embed_id: instaId,
        author_id: currentAuthorId,
        cover_url: `https://images.weserv.nl/?url=https://www.instagram.com/p/${instaId}/media/?size=l`
    }]);

    if (error) alert(error.message);
    else {
        document.getElementById('insta-id').value = '';
        document.getElementById('book-title').value = '';
        fetchBooks(currentAuthorId);
    }
};

window.fetchBooks = async function(authorId) {
    const { data } = await supabase.from('books').select('*').eq('author_id', authorId);
    const list = document.getElementById('books-list');
    list.innerHTML = data.map(book => `
        <div class="book-item">
            <img src="${book.cover_url}" class="book-preview-img">
            <div class="flex-1 text-sm font-medium">${book.title}</div>
            <button onclick="deleteBook('${book.id}')" class="text-xs text-gray-400">Delete</button>
        </div>
    `).join('');
};

window.deleteBook = async function(id) {
    await supabase.from('books').delete().eq('id', id);
    fetchBooks(currentAuthorId);
};