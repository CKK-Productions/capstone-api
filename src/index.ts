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


interface Employee {
  employee_id: number;
  email: string;
  password: string;
  fname: string;
  lname: string;
}

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

// app.get('/employee', async (req: Request, res: Response) => {
//   try {
//     const getAllEmployeesSql = 'SELECT * FROM employee';
//     const rows = await db.all(getAllEmployeesSql);
//     console.log('Rows:', rows);
//     if (rows.length === 0) {
//       console.log('No employees found');
//     } else {
//       console.log('Found ' + rows.length + ' employees.');
//     }
//   } catch (err) {
//     console.error(err.message);
//   }
// });

app.get('/employee', async (req: Request, res: Response) => {
  try {
    const employees: Employee[] = [];
    const getAllEmployeesSql = 'SELECT * FROM employee';
    console.log('Executing SQL query:', getAllEmployeesSql);
    db.each(
      getAllEmployeesSql,
      (err, row) => {
        if (err) {
          console.error('Error fetching employees:', err.message);
        } else {
          console.log('Fetched employee:', row);
          employees.push(row);
        }
      },
      () => {
        console.log('Finished fetching employees. Found', employees.length, 'employees.');
        res.json(employees);
      }
    );
  } catch (err) {
    console.error('Errors fetching employees:', err.message);
    res.status(500).json({ message: 'Internal server error' });
  }
});

app.get('/employee/:employee_id', async (req: Request, res: Response) => {
  try {
    const { employee_id } = req.params;
    console.log('ID:', employee_id);

    const getEmployeeSql = 'SELECT * FROM employee WHERE employee_id = ?';
    console.log('Query:', getEmployeeSql);

    const row = await db.get(getEmployeeSql, employee_id);
    console.log('Row:', row);

    if (!row) {
      console.log("Can't find the employee");
      res.sendStatus(404);
    } else {
      console.log('Found the employee with that ID', row);
      res.json(row);
    }
  } catch (err) {
    console.error('Errors fetching employee:', err.message);
    res.sendStatus(500);
  }
});

// app.get('/employee/:id', async (req: Request, res: Response) => {
//   try {
//     const { id } = req.params;
//     const getEmployeeSql = 'SELECT * FROM employee WHERE employee_id = ?';
//     const row = await db.get(getEmployeeSql, id);
//     console.log('Row:', row);
//     if (!row) {
//       console.log('Cant find the employee');
//       res.sendStatus(404);
//     } else {
//       console.log('Found the employee with that ID', row);
//       res.json(row);
//     }
//   } catch (err) {
//     console.error('Errors fetching employee:', err.message);
//     res.sendStatus(500);
//   }
// });

//create new feedback
app.post('/api/feedback', async (req: Request, res: Response) => {
  console.log(req.body);
  const { id, respond } = req.body;

  db.run(
      'INSERT INTO feedback (employee, respond) VALUES (?, ?)',
      [id, respond],
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

// app.get('/employee', async (req: Request, res: Response) => {
//   try {
//     const employees: Employee[] = [];
//     const getAllEmployeesSql = 'SELECT * FROM employee';
//     await db.each(getAllEmployeesSql, (err, row) => {
//       if (err) {
//         console.error(err.message);
//       } else {
//         employees.push(row);
//       }
//     });
//     console.log('Employees:', employees);
//   } catch (err) {
//     console.error(err.message);
//   }
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

// define a GET endpoint for getting the temp
app.get('/api/temp/:id', async (req, res) => {
  const accountId = req.params.id;

  // create an SQL query to get the password of the account from the database
  const getTempSql = `SELECT tempacc FROM temp WHERE current = ?`;
  const getTempParams = [accountId];

  // execute the SQL query
  db.get(getTempSql, getTempParams, async (err, row) => {
    if (err) {
      console.error(err.message);
      res.status(500).send({ message: 'Internal server error' });
    } else if (!row) {
      res.status(404).send({ message: 'Account not found' });
    } else {
      res.send(res);
    }
  });
});

app.listen(port, () => {
    console.log("Server running");
    const dataSql = fs.readFileSync('./src/data.sql', "utf-8");

    db.exec(dataSql);
});