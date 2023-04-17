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
const express_1 = __importDefault(require("express"));
const sqlite3_1 = __importDefault(require("sqlite3"));
const bcrypt_1 = __importDefault(require("bcrypt"));
const dotenv_1 = __importDefault(require("dotenv"));
const fs_1 = __importDefault(require("fs"));
const cors_1 = __importDefault(require("cors"));
dotenv_1.default.config();
const app = (0, express_1.default)();
const port = 3000;
app.use(express_1.default.json(), (0, cors_1.default)({
    origin: 'http://localhost:5173'
}));
let db = new sqlite3_1.default.Database('database.db', (err) => {
    if (err) {
        return console.error(err.message);
    }
    console.log("connected to db!");
});
app.get('/', (req, res) => {
    res.send("Hello");
});
//create new account
app.post('/api/accounts', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    console.log(req.body);
    const { fname, lname, email, password } = req.body;
    const hashedPassword = yield bcrypt_1.default.hash(password, 10);
    db.run('INSERT INTO employee (fname, lname, email, password) VALUES (?, ?, ?, ?)', [fname, lname, email, hashedPassword], (err) => {
        if (err) {
            console.error(err);
            res.status(500).send({ message: "Server Error" });
        }
        else {
            res.status(200).send({ message: "Success!" });
        }
    });
}));
app.post('/api/login', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    console.log(req.body);
    const { email, password } = req.body;
    // create an SQL query to get the user account from the database
    const sql = `SELECT * FROM employee WHERE email = ?`;
    const params = [email];
    // execute the SQL query
    db.get(sql, params, (err, row) => __awaiter(void 0, void 0, void 0, function* () {
        if (err) {
            console.error(err.message);
            return res.status(500).send({ error: 'Internal server error' });
        }
        if (!row) {
            res.status(400).send({ error: "Invalid Login Data" });
            return;
        }
        // Compare the hashed password with the provided password using bcrypt
        const match = yield bcrypt_1.default.compare(password, row.password);
        if (!match) {
            return res.status(401).send({ error: "Invalid Email or Password" });
        }
        const id = row.employee_id;
        res.send({ login: id });
    }));
}));
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
app.get('/employee', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const employees = [];
        const getAllEmployeesSql = 'SELECT * FROM employee';
        console.log('Executing SQL query:', getAllEmployeesSql);
        db.each(getAllEmployeesSql, (err, row) => {
            if (err) {
                console.error('Error fetching employees:', err.message);
            }
            else {
                console.log('Fetched employee:', row);
                employees.push(row);
            }
        }, () => {
            console.log('Finished fetching employees. Found', employees.length, 'employees.');
            res.json(employees);
        });
    }
    catch (err) {
        console.error('Errors fetching employees:', err.message);
        res.status(500).json({ message: 'Internal server error' });
    }
}));
app.get('/employee/:employee_id', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { employee_id } = req.params;
        console.log('ID:', employee_id);
        const getEmployeeSql = 'SELECT * FROM employee WHERE employee_id = ?';
        console.log('Query:', getEmployeeSql);
        const row = yield db.get(getEmployeeSql, employee_id);
        console.log('Row:', row);
        if (!row) {
            console.log("Can't find the employee");
            res.sendStatus(404);
        }
        else {
            console.log('Found the employee with that ID', row);
            res.json(row);
        }
    }
    catch (err) {
        console.error('Errors fetching employee:', err.message);
        res.sendStatus(500);
    }
}));
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
app.post('/api/feedback', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    console.log(req.body);
    const { id, respond } = req.body;
    db.run('INSERT INTO feedback (employee, respond) VALUES (?, ?)', [id, respond], (err) => {
        if (err) {
            console.error(err);
            res.status(500).send({ message: "Server Error" });
        }
        else {
            res.status(200).send({ message: "Success!" });
        }
    });
}));
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
app.post('/api/temp', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    console.log(req.body);
    const { tempnum, current } = req.body;
    console.log(tempnum);
    db.run('INSERT INTO temp (tempacc, current) VALUES (?, ?)', [tempnum, current], (err) => {
        if (err) {
            console.error(err);
            res.status(500).send({ error: "Server Error Temp" });
        }
        else {
            res.status(200).send({ message: "Success Temp!" });
        }
    });
}));
// remove from temp
app.post('/api/tempRid', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    db.run('DELETE FROM temp', (err) => {
        if (err) {
            console.error(err);
            res.status(500).send({ error: "Server Error Temp" });
        }
        else {
            res.status(200).send({ message: "Success Temp!" });
        }
    });
}));
// define a GET endpoint for getting the temp
app.get('/api/temp/:id', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const accountId = req.params.id;
    // create an SQL query to get the password of the account from the database
    const getTempSql = `SELECT tempacc FROM temp WHERE current = ?`;
    const getTempParams = [accountId];
    // execute the SQL query
    db.get(getTempSql, getTempParams, (err, row) => __awaiter(void 0, void 0, void 0, function* () {
        if (err) {
            console.error(err.message);
            res.status(500).send({ message: 'Internal server error' });
        }
        else if (!row) {
            res.status(404).send({ message: 'Account not found' });
        }
        else {
            res.send(res);
        }
    }));
}));
app.listen(port, () => {
    console.log("Server running");
    const dataSql = fs_1.default.readFileSync('./src/data.sql', "utf-8");
    db.exec(dataSql);
});
