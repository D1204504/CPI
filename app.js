var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');

var app = express();

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/users', usersRouter);

const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('db/sqlite.db', (err) => {
    if (err) {
        return console.error(err.message);
    }
    console.log('Connected to the SQlite database.');
});
//  撰寫 /api/ProductPrices 路由，使用 SQL 來查詢ProductPrices  所有的資料，回傳 json 格式的資料就好
app.get('/api/ProductPrices', (req, res) => {
    db.all('SELECT * FROM ProductPrices', (err, rows) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        res.json(rows);
    });
});
// 撰寫 get /api? ProductName= 路由，使用 SQLite 查詢 ProductPrices中，某 ProductName 提供的所有資料
app.get('/api/ProductPrices', (req, res) => {
    const ProductName = req.query.ProductName;
    db.all('SELECT * FROM ProductPrices WHERE ProductName = ?', [ProductName], (err, rows) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        res.json(rows);
    });
});

//撰寫 get /api/insert 路由，使用 SQLite 新增一筆資料 (ProductName, Specification, Date, Price)，到 ProductPrices 中
app.get('/api/insert', (req, res) => {
    const { ProductName, Specification, Date, Price } = req.query;
    db.run('INSERT INTO ProductPrices (ProductName, Specification, Date, Price) VALUES (?, ?, ?, ?)', [ProductName, Specification, Date, Price], function (err) {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        res.json({ id: this.lastID });
    });
});
//撰寫 post /api/insert 路由，使用 SQLite 新增一筆資料 (ProductName, Specification, Date, Price)，ProductPrices 中，回傳文字的訊息，不要 json
app.post('/api/insert', (req, res) => {
    const { ProductName, Specification, Date, Price } = req.body;
    db.run('INSERT INTO ProductPrices (ProductName, Specification, Date, Price) VALUES (?, ?, ?, ?)', [ProductName, Specification, Date, Price], function (err) {
        if (err) {
            res.status(500).send(err.message);
            return;
        }
        res.send('新增成功');
    });
});

//將上面表單的資料，透過 fetch async await 來發送 POST 請求到 /api/insert ，並在成功後，用 p 顯示伺服器回傳的【純文字】訊息，不是 json
app.post('/api/insert', async (req, res) => {
    const { ProductName, Specification, Date, Price } = req.body;
    const response = await fetch('/api/insert', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ ProductName, Specification, Date, Price }),
    });
    const text = await response.text();
    document.querySelector('p').textContent = text;
});










module.exports = app;
