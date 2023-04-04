"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
const fs_1 = __importDefault(require("fs"));
const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcrypt');
dotenv_1.default.config();
const app = express();
const port = process.env.PORT || 3000;
app.use(express.json());
// create a new sqlite database connection
const db = new sqlite3.Database('mydata.db', (err) => {
    if (err) {
        console.error(err.message);
    }
    else {
        console.log('Connected to the database.');
    }
});
app.get('/', (req, res) => {
    res.send("Hello");
});
//create new account
app.post('/employees', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    console.log(req.body);
    const { fname, lname, email } = req.body;
    db.run('INSERT INTO employee (fname, lname, email) VALUES (?, ?, ?)', [fname, lname, email], (err) => {
        if (err) {
            console.error(err);
            res.status(500).send('Server error');
        }
        else {
            res.status(200).send('Employee added successfully');
        }
    });
}));
// define a POST endpoint for creating a new account
app.post('/api/accounts', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { fname, lname, email, password } = req.body;
    // Hash the password using bcrypt
    const hashedPassword = yield bcrypt.hash(password, 10);
    // create an SQL query to add the new account to the database employee table
    let sql = `INSERT INTO employee (fname, lname, email) VALUES (?, ?, ?)`;
    let params = [fname, lname, email];
    // execute the SQL query
    db.run(sql, params, function (err) {
        if (err) {
            console.error(err.message);
            res.status(500).json({ error: 'Internal server error' });
        }
        else {
            res.json({ message: 'Account created successfully.' });
        }
    });
    // create an SQL query to add the new account to the database credential table
    sql = `INSERT INTO credential_id (password) VALUES (?)`;
    params = [hashedPassword];
    // execute the SQL query
    db.run(sql, params, function (err) {
        if (err) {
            console.error(err.message);
            res.status(500).json({ error: 'Internal server error' });
        }
        else {
            res.json({ message: 'Account created successfully.' });
        }
    });
}));
// define a POST endpoint for logging in
app.post('/api/login', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { username, password } = req.body;
    // create an SQL query to get the user account from the database
    const sql = `SELECT * FROM accounts WHERE username = ?`;
    const params = [username];
    // execute the SQL query
    db.get(sql, params, (err, row) => __awaiter(void 0, void 0, void 0, function* () {
        if (err) {
            console.error(err.message);
            return res.status(500).json({ error: 'Internal server error' });
        }
        if (!row) {
            res.status(400).json({ error: 'Invalid login data' });
            return;
        }
        // Compare the hashed password with the provided password using bcrypt
        const match = yield bcrypt.compare(password, row.password);
        if (!match) {
            return res.status(401).send('Invalid email or password');
        }
        res.json({ message: 'Login successful.' });
    }));
}));
// define a POST endpoint for logging in
app.post('/api/login', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { username, password } = req.body;
    // create an SQL query to get the user account from the database
    const sql = `SELECT * FROM accounts WHERE username = ?`;
    const params = [username]; //Does this connect through tables?
    // execute the SQL query
    db.get(sql, params, (err, row) => __awaiter(void 0, void 0, void 0, function* () {
        if (err) {
            console.error(err.message);
            return res.status(500).json({ error: 'Internal server error' });
        }
        if (!row) {
            res.status(400).json({ error: 'Invalid login data' });
            return;
        }
        // Compare the hashed password with the provided password using bcrypt
        const match = yield bcrypt.compare(password, row.password);
        if (!match) {
            return res.status(401).send('Invalid email or password');
        }
        res.json({ message: 'Login successful.' });
    }));
}));
app.listen(port, () => {
    console.log(`Server listening on port ${port}.`);
    const dataSql = fs_1.default.readFileSync('./src/data.sql', "utf-8");
    db.exec(dataSql);
});
