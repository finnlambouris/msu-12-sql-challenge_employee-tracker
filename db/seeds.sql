INSERT INTO department (name)
VALUES
    ("Administration"),
    ("Computer Science"),
    ("History"),
    ("Math"),
    ("English");

INSERT INTO role (title, salary, department_id)
VALUES
    ("Principal", 100000.00, 1),
    ("Computer Science teacher", 75000.00, 2),
    ("History teacher", 75000.00, 3),
    ("Math teacher", 75000.00, 4),
    ("English teacher", 75000.00, 5);

INSERT INTO employee (first_name, last_name, role_id)
VALUES
    ("Raymond", "Wells", 1),
    ("John", "Smith", 2),
    ("Olivia", "Matthews", 3),
    ("Jennie", "Cook", 4),
    ("Matthew", "Shaw", 5);

UPDATE employee
SET manager_id = 1
WHERE id BETWEEN 2 AND 5;