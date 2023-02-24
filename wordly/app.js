// Get the data from the URL
const urlParams = new URLSearchParams(window.location.search);
const data = urlParams.get('data');

// If there is data in the URL, send it to the server using AJAX
if (data) {
  const xhr = new XMLHttpRequest();
  xhr.open('POST', '/append', true);
  xhr.setRequestHeader('Content-Type', 'application/json');
  xhr.send(JSON.stringify({ data: data }));
}
