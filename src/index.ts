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

let db = new sqlite3.Database('database.db', (err) => {
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
                res.status(500).send({message: "Server Error"});
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

    const id = row.employee_id;

    res.send({login: id});
  });
  
});

// define a GET endpoint for getting the name of an account
// app.get('employee/:id/fname', async (req, res) => {
//   const accountId = req.params.id;

//   // create an SQL query to get the password of the account from the database
//   const getFnameSql = `SELECT fname FROM employee WHERE employee_id = ?`;
//   const getFnameParams = [accountId];

//   // execute the SQL query
//   db.get(getFnameSql, getFnameParams, async (err, row) => {
//     if (err) {
//       console.error(err.message);
//       res.status(500).json({ message: 'Internal server error' });
//     } else if (!row) {
//       res.status(404).json({ message: 'Account not found' });
//     } else {
//       res.json({ message: row.fname });
//     }
//   });
// });

// Insert into temp
app.post('/api/temp', async (req: Request, res: Response) => {
  console.log(req.body);
  const { tempnum, current } = req.body;
  console.log(tempnum);

  db.run(
      'INSERT INTO temp (tempacc, current) VALUES (?, ?)',
      [tempnum, current],
      (err) => {
          if (err) {
              console.error(err);
              res.status(500).send({error: "Server Error Temp"});
          } else {
              res.status(200).send({message: "Success Temp!"});
          }
      }
  )
});

// remove from temp
app.post('/api/tempRid', async (req: Request, res: Response) => {

  db.run(
      'DELETE FROM temp',
      (err) => {
          if (err) {
              console.error(err);
              res.status(500).send({error: "Server Error Temp"});
          } else {
              res.status(200).send({message: "Success Temp!"});
          }
      }
  )
});

app.listen(port, () => {
    console.log("Server running");
    // const dataSql = fs.readFileSync('./src/data.sql', "utf-8");

    // db.exec(dataSql);
});