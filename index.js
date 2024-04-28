const inquirer = require("inquirer");
const mysql = require("mysql2");
const Table = require("cli-table3");

// connects the application to the employee_tracker database
const db = mysql.createConnection(
    {
      host: "localhost",
      user: "root",
      password: "mySQLroot",
      database: "employee_tracker"
    },
    console.log(`Connected to the employee_tracker database.`)
);

// asks the user what they would like to do and routes them to the correct function based on their response
let initializeApp = async function() {
    let employeeManager = await inquirer.prompt(
        [
            {
                name: "options",
                type: "list",
                message: "What would you like to do?",
                choices: ["View All Departments", "Add a Department", "View All Roles", "Add A Role", "View All Employees", "Add An Employee", "Update An Employee Role", "Quit"]
            }
        ]
    )

    if (employeeManager.options === "View All Departments") {
        viewAllDepartments();
    } else if (employeeManager.options === "Add a Department") {
        addADepartment();
    } else if (employeeManager.options === "View All Roles") {
        viewAllRoles();
    } else if (employeeManager.options === "Add A Role") {
        addARole();
    } else if (employeeManager.options === "View All Employees") {
        viewAllEmployees();
    } else if (employeeManager.options === "Add An Employee") {
        addAnEmployee();
    } else if (employeeManager.options === "Update An Employee Role") {
        updateAnEmployeeRole();
    } else {
        console.log("Thank you for using the Employee Manager App!");
        return;
    }
}

// displays a table of all the departments and their IDs
let viewAllDepartments = function() {
    // selects everything from the department table
    db.query("SELECT * FROM department", (err, res) => {
        try {
            // creates a table using cli-table3
            const table = new Table({
                head: ["Department ID", "Department Name"]
            });

            // adds the response to the table
            res.forEach(row => {
                table.push([row.id, row.name]);
            });

            // displays the table
            console.log(table.toString());

            // returns to application homepage
            initializeApp();
        } catch {
            console.log(err);
        }
    });
}

// displays a table of all the role IDs, job titles, departments, and salaries
let viewAllRoles = function() {
    db.query(
        // selects the role IDs, job titles, departments, and salaries
        `SELECT 
            role.id, 
            title,
            department.name AS "department_name",
            salary
        FROM role
        INNER JOIN department
            ON role.department_id = department.id;`,

        (err, res) => {
            try {
                // creates a table using cli-table3
                const table = new Table({
                    head: ["Role ID", "Job Title", "Department Name", "Salary"]
                });

                // adds the response to the table
                res.forEach(row => {
                    table.push([row.id, row.title, row.department_name, row.salary]);
                });

                // displays the table
                console.log(table.toString());

                // returns to application homepage
                initializeApp();
            } catch {
                console.log(err);
            }
        }
    );
}

// displays a table of all the employee IDs, first names, last names, job titles, departments, salaries, and managers
let viewAllEmployees = function() {
    db.query(
        // selects the employee IDs, first names, last names, job titles, departments, salaries, and managers
        `SELECT 
            employee.id,
            employee.first_name,
            employee.last_name,
            role.title,
            department.name AS "department_name",
            role.salary,
            CONCAT(manager.first_name, " ", manager.last_name) AS manager
        FROM employee
        INNER JOIN role
            ON employee.role_id = role.id
        INNER JOIN department
            ON role.department_id = department.id
        LEFT JOIN employee AS manager
            ON employee.manager_id = manager.id;`,
        
        (err, res) => {
            try {
                // creates a table using cli-table3
                const table = new Table({
                    head: ["Employee ID", "First Name", "Last Name", "Job Title", "Department Name", "Salary", "Manager"]
                });

                // adds the response to the table
                res.forEach(row => {
                    if (row.manager === null) {
                        row.manager = "None";
                    }

                    table.push([row.id, row.first_name, row.last_name, row.title, row.department_name, row.salary, row.manager]);
                });

                // displays the table
                console.log(table.toString());

                // returns to application homepage
                initializeApp();
            } catch {
                console.log(err);
            }
        }
    );
}

// prompts the user to add a new department, and then adds it to the database
let addADepartment = async function() {
    let newDepartment = await inquirer.prompt(
        [
            {
                name: "department",
                type: "input",
                message: "What is the name of the new department?",
            }
        ]
    )

    newDepartment = newDepartment.department

    db.query(
        // inserts the new department into the database
        `INSERT INTO department (name)
        VALUES
            (?)`, [newDepartment],
            (err, res) => {
            try {
                // alerts the user that their department has been added to the database
                console.log(`The ${newDepartment} department has been added to the database.`);
                
                // returns to application homepage
                initializeApp();
            } catch {
                console.log(err);
            }
        }
    );
}

// prompts the user to add a new role, its' salary, and its' department, and then adds them to the database
let addARole = async function() {
    // prompts the user to add a new role
    let addNewRole = async function() {
        let newRole = await inquirer.prompt(
            [
                {
                    name: "role",
                    type: "input",
                    message: "What is the name of the new role?",
                }
            ]
        )
        newRole = newRole.role
        addNewSalary(newRole);
    }

    // prompts the user to add the salary of the new role
    let addNewSalary = async function(newRole) {
        let newSalary = await inquirer.prompt(
            [
                {
                    name: "salary",
                    type: "input",
                    message: "What is the salary of the new role?",
                }
            ]
        )
        newSalary = newSalary.salary
        viewDepartments(newRole, newSalary);
    }

    // selects all departments in the database and adds them to an array
    let viewDepartments = function(newRole, newSalary) {
        db.query("SELECT * FROM department", (err, res) => {
            try {
                let departments = []
                res.forEach(department => {
                    departments.push(department.name);
                })
                setDepartment(newRole, newSalary, departments);
            } catch {
                console.log(err);
            }
        });
    }

    // prompts the user to select the department of the new role from a list of all the departments
    let setDepartment = async function(newRole, newSalary, departments) {
        let department = await inquirer.prompt(
            [
                {
                    name: "department",
                    type: "list",
                    message: "Which department does the new role belong to?",
                    choices: departments,
                }
            ]
        )
        department = department.department
        findSelectedDepartment(newRole, newSalary, department)
    };

    // finds the selected department
    let findSelectedDepartment = function(newRole, newSalary, department) {
        db.query("SELECT * FROM department", (err, res) => {
            let selectedDepartment = null
            res.forEach(row => {
                if (row.name === department) {
                    selectedDepartment = row.id;
                    updateEmployeeDatabase(newRole, newSalary, selectedDepartment);
                }
            });
        });
    }

    // adds the new role, its' salary, and its' department to the database
    let updateEmployeeDatabase = function(newRole, newSalary, selectedDepartment) {
        db.query(
            `INSERT INTO role (title, salary, department_id)
            VALUES
                (?, ?, ?)`, [newRole, newSalary, selectedDepartment],
                (err, res) => {
                    try {
                        // alerts the user that their role has been added to the database
                        console.log(`the ${newRole} role was added to the database.`);

                        // returns to application homepage
                        initializeApp();
                    } catch {
                        console.log(err);
                    }
                }
        )
    }

    // starts the prompting
    addNewRole();
}

// prompts the user to add a new employee name, their role, and their manager, and then adds them to the database
let addAnEmployee = function() {
    // prompts the user to add a new employee's first name
    let addEmployeeFirstname = async function() {
        let firstname = await inquirer.prompt(
            [
                {
                    name: "firstname",
                    type: "input",
                    message: "What is the employee's first name?",
                }
            ]
        )
        firstname = firstname.firstname
        addEmployeeLastname(firstname);
    }

    // prompts the user to add a new employee's last name
    let addEmployeeLastname = async function(firstname) {
        let lastname = await inquirer.prompt(
            [
                {
                    name: "lastname",
                    type: "input",
                    message: "What is the employee's last name?",
                }
            ]
        )
        lastname = lastname.lastname
        viewRoles(firstname, lastname);
    }

    // selects all the roles in the database and adds them to an array
    let viewRoles = function(firstname, lastname) {
        db.query("SELECT * FROM role", (err, res) => {
            let roles = []
            res.forEach(role => {
                roles.push(role.title);
            })
            addEmployeeRole(firstname, lastname, roles);
        });
    }

    // prompts the user to select the role of the new employee from a list of all the roles
    let addEmployeeRole = async function(firstname, lastname, roles) {
        let role = await inquirer.prompt(
            [
                {
                    name: "role",
                    type: "list",
                    message: "What is the employee's role?",
                    choices: roles,
                }
            ]
        )
        role = role.role
        viewManagers(firstname, lastname, role);
    }

    // selects all the employee's names in the database and adds them to an array
    let viewManagers = function(firstname, lastname, role) {
        db.query(
            `SELECT CONCAT(first_name, " ", last_name) AS manager FROM employee`, (err, res) => {
                let managers = ["none"];
                res.forEach(row => {
                    managers.push(row.manager);
                })
                addEmployeeManager(firstname, lastname, role, managers);
        });
    }

    // prompts the user to select the manager of the new employee from a list of all the employees
    let addEmployeeManager = async function(firstname, lastname, role, managers) {
        let manager = await inquirer.prompt(
            [
                {
                    name: "manager",
                    type: "list",
                    message: "Who is the employee's manager?",
                    choices: managers,
                }
            ]
        )
        manager = manager.manager
        findSelectedRole(firstname, lastname, role, manager);
    }

    // finds the selected role
    let findSelectedRole = function(firstname, lastname, role, manager) {
        db.query("SELECT * FROM role", (err, res) => {
            let selectedRole = null
            res.forEach(row => {
                if (row.title === role) {
                    selectedRole = row.id;
                }
            });
            updateEmployeeDatabase(firstname, lastname, selectedRole, manager);
        });
    }

    // inserts the new employee's first name, last name, and role into the database
    let updateEmployeeDatabase = function(firstname, lastname, selectedRole, manager) {
        db.query(
            `INSERT INTO employee (first_name, last_name, role_id)
            VALUES
                (?, ?, ?)`, [firstname, lastname, selectedRole],
                (err, res) => {
                    findManager(firstname, lastname, selectedRole, manager);
                }
        );
    }

    // finds the selected manager
    let findManager = function(firstname, lastname, selectedRole, manager) {
        db.query("SELECT * FROM employee", (err, res) => {
            let selectedManager = null
            res.forEach(row => {
                if (row.first_name + " " + row.last_name === manager) {
                    selectedManager = row.id;
                    updateManager(firstname, lastname, selectedRole, selectedManager);
                }
            });
            if (!selectedManager) {
                console.log(`${firstname} ${lastname} was added to the database.`);
                initializeApp();
            }
        });
    }

    // inserts the new employee's manager into the database
    let updateManager = function(firstname, lastname, selectedRole, selectedManager) {
        db.query(
            `UPDATE employee
            SET manager_id = ?
            WHERE first_name = ? AND last_name = ? AND role_id = ?`, [selectedManager, firstname, lastname, selectedRole],
            (req, res) => {
                console.log(`${firstname} ${lastname} was added to the database.`);
                initializeApp();
            }
        )
    }

    // starts the prompting
    addEmployeeFirstname();
}

// prompts the user to update an employee's role, and then updates it in the database
let updateAnEmployeeRole = function() {
    // selects all the employee's names in the database and adds them to an array
    let searchEmployees = function() {
        db.query(
            `SELECT CONCAT(first_name, " ", last_name) AS name FROM employee`, (err, res) => {
                let employees = [];
                res.forEach(row => {
                    employees.push(row.name);
                });
                selectEmployee(employees);
            }
        );
    }

    // prompts the user to select the employee from a list of all the employees
    let selectEmployee = async function(employees) {
        let updatedEmployee = await inquirer.prompt(
            [
                {
                    name: "employee",
                    type: "list",
                    message: "Which employee would you like to update?",
                    choices: employees,
                }
            ]
        )
        updatedEmployee = updatedEmployee.employee
        findEmployeeId(updatedEmployee);
    }

    // finds the id of the selected employee
    findEmployeeId = function(updatedEmployee) {
        db.query(
            `SELECT CONCAT(first_name, " ", last_name) AS name, id FROM employee`, (err, res) => {
                let employeeId = null
                res.forEach(row => {
                    if(row.name === updatedEmployee) {
                        employeeId = row.id
                        viewRoles(updatedEmployee, employeeId);
                    }
                });
            }
        );
    }

    // selects all the roles from the database and adds them to an array
    let viewRoles = function(updatedEmployee, employeeId) {
        db.query("SELECT * FROM role", (err, res) => {
            let roles = []
            res.forEach(role => {
                roles.push(role.title);
            })
            selectNewRole(updatedEmployee, employeeId, roles);
        });
    }

    // prompts the user to select the employee's new role from the list of roles
    let selectNewRole = async function(updatedEmployee, employeeId, roles) {
        let newRole = await inquirer.prompt(
            [
                {
                    name: "role",
                    type: "list",
                    message: "What is the employee's new role?",
                    choices: roles,
                }
            ]
        )
        newRole = newRole.role
        findSelectedRole(updatedEmployee, employeeId, newRole);
    }

    // finds the selected role
    let findSelectedRole = function(updatedEmployee, employeeId, newRole) {
        db.query("SELECT * FROM role", (err, res) => {
            let selectedRole = null
            res.forEach(row => {
                if(row.title === newRole) {
                    selectedRole = row.id;   
                    updateEmployeeDatabase(updatedEmployee, employeeId, selectedRole);        
                }
            });
        });
    }

    // updates the selected employee's new role in the database
    let updateEmployeeDatabase = function(updatedEmployee, employeeId, selectedRole) {
        db.query(
            `UPDATE employee
            SET role_id = ?
            WHERE id = ?`, [selectedRole, employeeId],
            (err, res) => {
                console.log(`${updatedEmployee}'s new role has been set.`);
                initializeApp();
            }
        );
    }

    // starts the prompting
    searchEmployees();
}

// initializes the app
initializeApp();