import express, {Express, Request, Response} from 'express';
import sqlite3 from 'sqlite3';
import bcrypt from 'bcrypt';
import dotenv from 'dotenv';
import { Voice, getTTS } from './tts.js';
import fs from 'fs';
import cors from 'cors'
dotenv.config()

const app: Express = express();
const port = 3000;
app.use(express.json(), cors({
  origin: 'http://localhost:5173'
}));

let db = new sqlite3.Database('mydata.db', (err) => {
    if (err) {
        return console.error(err.message);
    }
    console.log("connected to db!");
})


app.get('/', (req: Request, res: Response) => {
    res.send("Hello");
});

//create new account
app.post('/api/accounts', async (req: Request, res: Response) => {
    console.log(req.body);
    const { fname, lname, email, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);

    db.run(
        'INSERT INTO employee (fname, lname, email, password) VALUES (?, ?, ?, ?)',
        [fname, lname, email, hashedPassword],
        (err) => {
            if (err) {
                console.error(err);
                res.status(500).send({error: "Server Error"});
            } else {
                res.status(200).send({message: "Success!"});
            }
        }
    )
});

app.post('/api/login', async (req, res) => {
  console.log(req.body);
  const { email , password } = req.body;

  // create an SQL query to get the user account from the database
  const sql = `SELECT * FROM employee WHERE email = ?`;
  const params = [email];

  // execute the SQL query
  db.get(sql, params, async (err, row) => {
    if (err) {
      console.error(err.message);
      return res.status(500).send({ error: 'Internal server error' });
    }

    if (!row) {
      res.status(400).send({error: "Invalid Login Data"});
      return;
    }

    // Compare the hashed password with the provided password using bcrypt
    const match = await bcrypt.compare(password, row.password);
    if (!match) {
      return res.status(401).send({error: "Invalid Email or Password"});
    }

    // const test = row.password;
    // console.log(test);
    // console.log(row.employee_id);
    //res.send(row.employee_id);
    //res.send({token: "inserttokenhere"});
    res.send({login: "true"});
  });
});

app.listen(port, () => {
    console.log("Server running");
    // const dataSql = fs.readFileSync('./src/data.sql', "utf-8");

    // db.exec(dataSql);
});