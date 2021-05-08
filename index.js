const express = require('express');
const app = express();
const path = require('path');

const DIST_DIR = path.join(__dirname, '/.build');
const HTML_FILE = path.join(DIST_DIR, 'main.html')

console.log(DIST_DIR, HTML_FILE);
app.use(express.static(DIST_DIR));

app.get('/*', function (req, res) {
    res.sendFile(HTML_FILE);
});
app.listen(3000, function () {
    console.log('Example appp listening on port 3000!');
});