BEGIN TRANSACTION;
 
create table IF NOT EXISTS employee (
    employee_id INTEGER PRIMARY KEY AUTOINCREMENT,
    fname CHAR(20) NOT NULL,
    lname CHAR(20) NOT NULL,
    email CHAR(100) NOT NULL UNIQUE,
	password BLOB NOT NULL
);

create table IF NOT EXISTS question (
    question_id INTEGER PRIMARY KEY AUTOINCREMENT,
    alt_question_id CHAR(50) NOT NULL,
    question_text CHAR(100) NOT NULL
);

create table IF NOT EXISTS question_answer_option (
    question_answer_option_id INTEGER PRIMARY KEY AUTOINCREMENT,
    display_value CHAR(100) NOT NULL,
    question_id INT NOT NULL,
    FOREIGN KEY (question_id) REFERENCES question(question_id)
);

create table IF NOT EXISTS level (
    level_id INTEGER PRIMARY KEY AUTOINCREMENT,
    description CHAR(100) NOT NULL
);

create table IF NOT EXISTS level_question (
    level_question_id INTEGER PRIMARY KEY AUTOINCREMENT,
    level_id INT NOT NULL,
    question_id INT NOT NULL,
    FOREIGN KEY (level_id) REFERENCES level(level_id),
    FOREIGN KEY (question_id) REFERENCES question(question_id)
);

create table IF NOT EXISTS level_status (
    level_status_id INTEGER PRIMARY KEY AUTOINCREMENT,
    description CHAR(100) NOT NULL
);

create table IF NOT EXISTS temp (
    tempacc INT,
    current CHAR(10)
);

create table IF NOT EXISTS game (
    game_id INTEGER PRIMARY KEY AUTOINCREMENT,
    title CHAR(100) NOT NULL,
    level_id INT NOT NULL,
    level_status_id INT NOT NULL,
    initiated_by INT NOT NULL,
    initiated_on DATE,
    completed_by INT NOT NULL,
    completed_on DATE,
	fail_amount INT NOT NULL,
	pass CHAR(1),
    FOREIGN KEY (level_id) REFERENCES level(level_id),
    FOREIGN KEY (level_status_id) REFERENCES level_status(level_status_id),
    FOREIGN KEY (initiated_by) REFERENCES employee(employee_id),
    FOREIGN KEY (completed_by) REFERENCES employee(employee_id)
);

COMMIT; 