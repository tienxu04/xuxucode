#paste vào console


## prove to be working

(function () {
  // tìm link mp4 trong toàn bộ HTML
  const html = document.documentElement.innerHTML;
  const match = html.match(/https?:\/\/[^"' ]+\.mp4/);

  if (!match) {
    alert("Không tìm thấy link MP4");
    return;
  }

  const mp4 = match[0];

  // tạo modal
  const modal = document.createElement("div");
  modal.style = `
    position:fixed;
    top:0;
    left:0;
    width:100%;
    height:100%;
    background:rgba(0,0,0,0.7);
    display:flex;
    align-items:center;
    justify-content:center;
    z-index:999999;
    font-family:sans-serif;
  `;

  const box = document.createElement("div");
  box.style = `
    background:#fff;
    padding:25px;
    border-radius:10px;
    text-align:center;
    max-width:420px;
  `;

  box.innerHTML = `
    <h3>MP4 Found</h3>
    <p style="word-break:break-all;font-size:12px">${mp4}</p>
    <a href="${mp4}" download
      style="display:inline-block;margin-top:10px;padding:10px 18px;
      background:#ff3b3b;color:#fff;text-decoration:none;border-radius:6px">
      Click to Download
    </a>
    <br><br>
    <button id="closeModal" style="padding:6px 12px">Close</button>
  `;

  modal.appendChild(box);
  document.body.appendChild(modal);

  document.getElementById("closeModal").onclick = () => modal.remove();
})();

##
(function () {
  // tìm link mp4 trong toàn bộ HTML
  const html = document.documentElement.innerHTML;
  const match = html.match(/https?:\/\/[^"' ]+\.mp4/);

  if (!match) {
    alert("Không tìm thấy link MP4");
    return;
  }

  const mp4 = match[0];

  // tạo modal
  const modal = document.createElement("div");
  modal.style = `
    position:fixed;
    top:0;
    left:0;
    width:100%;
    height:100%;
    background:rgba(0,0,0,0.7);
    display:flex;
    align-items:center;
    justify-content:center;
    z-index:999999;
    font-family:sans-serif;
  `;

  const box = document.createElement("div");
  box.style = `
    background:#fff;
    padding:25px;
    border-radius:10px;
    text-align:center;
    max-width:420px;
  `;

  box.innerHTML = `
    <h3>MP4 Found</h3>
    <p style="word-break:break-all;font-size:12px">${mp4}</p>
    <a href="${mp4}" download
      style="display:inline-block;margin-top:10px;padding:10px 18px;
      background:#ff3b3b;color:#fff;text-decoration:none;border-radius:6px">
      Click to Download
    </a>
    <br><br>
    <button id="closeModal" style="padding:6px 12px">Close</button>
  `;

  modal.appendChild(box);
  document.body.appendChild(modal);

  document.getElementById("closeModal").onclick = () => modal.remove();
})();

#another ver - by chatgpt

(function(){

const found = new Set();

function add(url){
 if(!url) return;
 if(/\.(mp4|m3u8|webm|mov|mpd)(\?|$)/i.test(url)){
  if(!found.has(url)){
   found.add(url);
   render();
  }
 }
}

const origFetch = window.fetch;
window.fetch = async function(...args){
 const res = await origFetch.apply(this,args);
 try{ add(args[0]); }catch(e){}
 return res;
};

const origOpen = XMLHttpRequest.prototype.open;
XMLHttpRequest.prototype.open = function(method,url){
 add(url);
 return origOpen.apply(this,arguments);
};

const origSet = Object.getOwnPropertyDescriptor(HTMLMediaElement.prototype,"src").set;
Object.defineProperty(HTMLMediaElement.prototype,"src",{
 set:function(v){
  add(v);
  return origSet.call(this,v);
 }
});

document.querySelectorAll("video,source").forEach(v=>add(v.src));

const html = document.documentElement.innerHTML;
const r=/https?:\/\/[^"' ]+\.(mp4|m3u8|webm|mov|mpd)[^"' ]*/gi;
let m;
while((m=r.exec(html))!==null){ add(m[0]); }

function render(){

let modal=document.getElementById("videoExtractorPro");

if(!modal){

modal=document.createElement("div");
modal.id="videoExtractorPro";
modal.style=`
position:fixed;
top:0;
left:0;
width:100%;
height:100%;
background:rgba(0,0,0,.85);
display:flex;
align-items:center;
justify-content:center;
z-index:999999;
font-family:Arial;
`;

const box=document.createElement("div");
box.style=`
background:#fff;
padding:20px;
border-radius:10px;
max-width:750px;
max-height:80%;
overflow:auto;
`;

box.id="videoExtractorBox";

modal.appendChild(box);
document.body.appendChild(modal);

}

const box=document.getElementById("videoExtractorBox");

let html="<h3>Universal Video Extractor PRO</h3>";

found.forEach(url=>{
 html+=`
 <div style="margin-bottom:12px;border-bottom:1px solid #ddd;padding-bottom:8px">
 <div style="font-size:12px;word-break:break-all">${url}</div>
 <a href="${url}" target="_blank">Open</a> |
 <a href="${url}" download>Download</a> |
 <a href="#" onclick="navigator.clipboard.writeText('${url}')">Copy</a>
 </div>
 `;
});

html+=`<button onclick="document.getElementById('videoExtractorPro').remove()">Close</button>`;

box.innerHTML=html;

}

alert("Video Extractor PRO active. Press play.");

})();

##

(function(){

const html = document.documentElement.innerHTML;

const regex = /https?:\/\/[^"'\\ ]+\.(mp4|m3u8|webm|mov|mpd)[^"'\\ ]*/gi;
const found = new Set();

let m;
while ((m = regex.exec(html)) !== null) {
  found.add(m[0]);
}

document.querySelectorAll("video source, video").forEach(v=>{
  if(v.src) found.add(v.src);
});

if(found.size === 0){
  alert("No video links found");
  return;
}

const modal = document.createElement("div");
modal.style = `
position:fixed;
top:0;
left:0;
width:100%;
height:100%;
background:rgba(0,0,0,.8);
display:flex;
align-items:center;
justify-content:center;
z-index:999999;
font-family:Arial;
`;

const box = document.createElement("div");
box.style = `
background:#fff;
padding:20px;
border-radius:10px;
max-width:700px;
max-height:80%;
overflow:auto;
`;

let list = "";

[...found].forEach((url,i)=>{
list += `
<div style="margin-bottom:12px;border-bottom:1px solid #ddd;padding-bottom:8px">
<div style="font-size:12px;word-break:break-all">${url}</div>
<a href="${url}" target="_blank">Open</a> |
<a href="${url}" download>Download</a> |
<a href="#" onclick="navigator.clipboard.writeText('${url}')">Copy</a>
</div>
`;
});

box.innerHTML = `
<h3>Universal Video Extractor</h3>
${list}
<button id="closeVideoModal">Close</button>
`;

modal.appendChild(box);
document.body.appendChild(modal);

document.getElementById("closeVideoModal").onclick=()=>modal.remove();

})();
