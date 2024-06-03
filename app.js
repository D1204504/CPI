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
const db = new sqlite3.Database('db/CPI.db', (err) => {
    if (err) {
        return console.error(err.message);
    }
    console.log('Connected to the SQlite database.');
});

app.get('/api/CPI', (req, res) => {
    db.all('SELECT * FROM CPI', (err, rows) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        res.json(rows);
    });
});

app.get('/api/CPI', (req, res) => {
    const Price = req.query.Price;
    db.all('SELECT * FROM data WHERE CPI = ?', Price, (err, rows) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        res.json(rows);
    });
});

const ck_db = new sqlite3.Database('db/ck.db', (err) => {
    if (err) {
        return console.error(err.message);
    }
    console.log('Connected to the ck database.');
});

const pork_db = new sqlite3.Database('db/pork.db', (err) => {
    if (err) {
        return console.error(err.message);
    }
    console.log('Connected to the pork database.');
});

const egg_db = new sqlite3.Database('db/egg.db', (err) => {
    if (err) {
        return console.error(err.message);
    }
    console.log('Connected to the egg database.');
});

app.get('/api/chicken', (req, res) => {
    ck_db.all('SELECT * FROM chicken_prices', (err, rows) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        res.json(rows);
    });
});

app.get('/api/pork', (req, res) => {
    pork_db.all('SELECT * FROM pork_prices', (err, rows) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        res.json(rows);
    });
});

app.get('/api/egg', (req, res) => {
    egg_db.all('SELECT * FROM egg_prices', (err, rows) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        res.json(rows);
    });
});

// 留言板数据库
const feedback_db = new sqlite3.Database('db/feedback.db', (err) => {
    if (err) {
        return console.error(err.message);
    }
    console.log('Connected to the feedback database.');
});

// 获取所有留言
app.get('/api/feedback', (req, res) => {
    feedback_db.all('SELECT * FROM feedback ORDER BY timestamp DESC', (err, rows) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        res.json(rows);
    });
});

// 提交新留言
app.post('/api/feedback', (req, res) => {
    const { subject, message, nickname } = req.body;
    const query = `INSERT INTO feedback (subject, message, nickname) VALUES (?, ?, ?)`;
    feedback_db.run(query, [subject, message, nickname], function(err) {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        res.status(201).json({ id: this.lastID });
    });
});

module.exports = app;
