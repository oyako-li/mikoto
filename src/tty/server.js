const express = require('express');

const app = express();
// const router = app.Router();
app.get('/', (req, res) => {
  res.send('Hi there');
});

app.get('/clearker', (req, res) => {
    // res.send('Hi there');
    let html = require('fs').readFileSync('index.html');
    res.writeHead(200,{'Content-Type':'text/html;charset=utf-8'});
    process.on('uncaughtException', (e) => console.log(e));
    res.end(html);
});

app.use(express.static('public'));
app.use('/node_modules',express.static('node_modules'));

app.listen(8080, () => {
  console.log('Listening on port 8080');
});

