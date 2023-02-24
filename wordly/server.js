const fs = require('fs');
const express = require('express');
const bodyParser = require('body-parser');

const app = express();

// Parse incoming request bodies as JSON
app.use(bodyParser.json());

// Handle POST requests to the /append endpoint
app.post('/append', (req, res) => {
  // Extract the data from the request body
  const data = req.body.data;

  // Append the data to a text file
  fs.appendFileSync('data.txt', data + '\n');

  // Send a response to the client
  res.sendStatus(200);
});

// Serve the HTML file
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html');
});

// Start the server
app.listen(3000, () => {
  console.log('Server listening on port 3000');
});
