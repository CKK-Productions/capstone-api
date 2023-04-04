
import dotenv from 'dotenv';
import { Voice, getTTS } from './tts.js';
import fs from 'fs';

const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcrypt');

dotenv.config()

const app = express();
const port = process.env.PORT || 3000;
app.use(express.json());

// create a new sqlite database connection
const db = new sqlite3.Database('mydata.db', (err) => {
    if (err) {
      console.error(err.message);
    } else {
      console.log('Connected to the database.');
    }
  });

// Visualization when loading page
app.get('/', (req: Request, res: Response) => {
    res.send("Hello");
});

//create new account
app.post('/employees', async (req: Request, res: Response) => {
    console.log(req.body)
    const { fname, lname, email } = req.body;

    db.run(
        'INSERT INTO employee (fname, lname, email) VALUES (?, ?, ?)',
        [fname, lname, email],
        (err) => {
            if (err) {
                console.error(err);
                res.status(500).send('Server error');
            } else {
                res.status(200).send('Employee added successfully');
            }
        }
    )
});

// define a POST endpoint for creating a new account
app.post('/api/accounts', async (req: Request, res: Response) => {
    const { fname, lname, email, password } = req.body;
  
    // Hash the password using bcrypt
    const hashedPassword = await bcrypt.hash(password, 10);
  
    // create an SQL query to add the new account to the database employee table
    let sql = `INSERT INTO employee (fname, lname, email) VALUES (?, ?, ?)`;
    let params = [fname, lname, email];
  
    // execute the SQL query
    db.run(sql, params, function(err) {
      if (err) {
        console.error(err.message);
        res.status(500).json({ error: 'Internal server error' });
      } else {
        res.json({ message: 'Account created successfully.' });
      }
    })
    
    // check if this is how you should add to other tables at the same time
    // create an SQL query to add the new account to the database credential table
    sql = `INSERT INTO credential_id (password) VALUES (?)`
    params = [hashedPassword];

    // execute the SQL query
    db.run(sql, params, function(err) {
        if (err) {
            console.error(err.message);
            res.status(500).send('Server error');
        } else {
            res.status(200).send('Employee added successfully');
        }
    });
});

// define a POST endpoint for logging in
app.post('/api/login', async (req : Request, res : Response) => {
    const { username, password } = req.body;
  
  
    // create an SQL query to get the user account from the database
    const sql = `SELECT * FROM accounts WHERE username = ?`;
    const params = [username];
  
    // execute the SQL query
    db.get(sql, params, async (err, row) => {
      if (err) {
        console.error(err.message);
        res.status(500).send('Server error');
      }
  
      if (!row) {
        res.status(400).send('Invalid login data');
        return;
      }
  
      // Compare the hashed password with the provided password using bcrypt
      const match = await bcrypt.compare(password, row.password);
      if (!match) {
        return res.status(401).send('Invalid email or password');
      }
  
      res.send('Login successful.');
    });
});


app.listen(port, () => {
    console.log(`Server listening on port ${port}.`);
    
    // was used for establishing database
    //const dataSql = fs.readFileSync('./src/data.sql', "utf-8");
    //db.exec(dataSql);
});

