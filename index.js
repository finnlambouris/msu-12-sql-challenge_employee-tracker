const inquirer = require("inquirer");
const mysql = require("mysql2");
const Table = require("cli-table3");

const db = mysql.createConnection(
    {
      host: "localhost",
      user: "root",
      password: "mySQLroot",
      database: "employee_tracker"
    },
    console.log(`Connected to the employee_tracker database.`)
  );

let initializeApp = async function() {
    let employeeManager = await inquirer.prompt(
        [
            {
                name: "options",
                type: "list",
                message: "What would you like to do?",
                choices: ["View All Departments", "View All Roles", "View All Employees", "Add a Department", "Add A Role", "Add An Employee", "Update An Employee Role"]
            }
        ]
    )

    if (employeeManager.options === "View All Departments") {
        viewAllDepartments();
    } else if (employeeManager.options === "View All Roles") {
        viewAllRoles();
    } else if (employeeManager.options === "View All Employees") {
        viewAllEmployees();
    } else if (employeeManager.options === "Add a Department") {
        addADepartment();
    } else if (employeeManager.options === "Add A Role") {
        addARole();
    } else if (employeeManager.options === "Add An Employee") {
        addAnEmployee();
    } else if (employeeManager.options === "Update An Employee Role") {
        updateAnEmployeeRole();
    }
}

let viewAllDepartments = function() {
    db.query("SELECT * FROM department", (err, res) => {
        if (err) {
          console.log(err);
        } else {
            const table = new Table({
                head: ["Department ID", "Department Name"]
            });

            res.forEach(row => {
                table.push([row.id, row.name]);
            });

            console.log(table.toString());

            initializeApp();
        }
    });
}

let viewAllRoles = function() {
    db.query(
        `SELECT 
            role.id, 
            title,
            department.name AS "department_name",
            salary
        FROM role
        INNER JOIN department
            ON role.department_id = department.id;`, (err, res) => {
        
            if (err) {
            console.log(err);
            } else {
                const table = new Table({
                    head: ["Role ID", "Job Title", "Department Name", "Salary"]
                });

                res.forEach(row => {
                    table.push([row.id, row.title, row.department_name, row.salary]);
                });

                console.log(table.toString());

                initializeApp();
            }
        }
    );
}

let viewAllEmployees = function() {
    db.query(
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
            ON employee.manager_id = manager.id;`, (err, res) => {
        
            if (err) {
                console.log(err);
            } else {
                const table = new Table({
                    head: ["Employee ID", "First Name", "Last Name", "Job Title", "Department Name", "Salary", "Manager"]
                });

                res.forEach(row => {
                    if (row.manager === null) {
                        row.manager = "None";
                    }

                    table.push([row.id, row.first_name, row.last_name, row.title, row.department_name, row.salary, row.manager]);
                });

                console.log(table.toString());

                initializeApp();
            }
        }
    );
}

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

    db.query(
        `INSERT INTO department (name)
        VALUES
            ("${newDepartment.department}")`,  (err, res) => {
        
            if (err) {
                console.log(err);
            } else {
                console.log(res);
                initializeApp();
            }
        }
    );
}

let addARole = async function() {
    
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
        addNewSalary(newRole);
    }

    addNewRole();

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
        viewDepartments(newRole, newSalary);
    }

    let viewDepartments = function(newRole, newSalary) {
        db.query("SELECT * FROM department", (err, res) => {
            var departments = []
            res.forEach(department => {
                departments.push(department.name);
            })
            setDepartment(newRole, newSalary, departments);
        });
    }

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
        updateDepartmentDatabase(newRole, newSalary, department)
    };

    let updateDepartmentDatabase = function(newRole, newSalary, department) {
        db.query("SELECT * FROM department", (err, res) => {
            console.log(res);

            let selectedDepartment = null
            res.forEach(row => {
                if(row.name === department.department) {
                    selectedDepartment = row.id;
                    console.log(selectedDepartment);
                }
            });

            db.query(
                `INSERT INTO role (title, salary, department_id)
                VALUES
                    ("${newRole.role}", ${newSalary.salary}, "${selectedDepartment}")`, (err, res) => {
                        console.log(res);
                        initializeApp();
                    }
            )
        });
    }
}

let addAnEmployee = function() {

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
        addEmployeeLastname(firstname);
    }

    addEmployeeFirstname();

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
        viewRoles(firstname, lastname);
    }

    let viewRoles = function(firstname, lastname) {
        db.query("SELECT * FROM role", (err, res) => {
            var roles = []
            res.forEach(role => {
                roles.push(role.title);
            })
            addEmployeeRole(firstname, lastname, roles);
        });
    }

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
        viewManagers(firstname, lastname, role);
    }

    let viewManagers = function(firstname, lastname, role) {
        db.query(
            `SELECT CONCAT(first_name, " ", last_name) AS manager FROM employee`, (err, res) => {
                var managers = ["none"];
                res.forEach(row => {
                    managers.push(row.manager);
                })
                addEmployeeManager(firstname, lastname, role, managers);
        });
    }

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
        updateEmployeeDatabase(firstname, lastname, role, manager);
    }

    let updateEmployeeDatabase = function(firstname, lastname, role, manager) {
        let updateInfo = async function() {
            db.query("SELECT * FROM role", (err, res) => {
                
                let selectedRole = null
                res.forEach(row => {
                    if(row.title === role.role) {
                        selectedRole = row.id;
                    }
                });

                db.query(
                    `INSERT INTO employee (first_name, last_name, role_id)
                    VALUES
                        ("${firstname.firstname}", "${lastname.lastname}", "${selectedRole}")`, (err, res) => {
                            console.log(res);
                            updateManager(selectedRole);
                        }
                );
            });
        }
        
        updateInfo();

        let updateManager = async function(selectedRole) {
            db.query("SELECT * FROM employee", (err, res) => {

                let selectedManager = null
                res.forEach(row => {
                    if(row.first_name + " " + row.last_name === manager.manager) {
                        selectedManager = row.id;
                    }
                });

                db.query(
                    `UPDATE employee
                    SET manager_id = ${selectedManager}
                    WHERE first_name = "${firstname.firstname}" AND last_name = "${lastname.lastname}" AND role_id = "${selectedRole}"`, (req, res) => {
                        console.log(res);
                        initializeApp();
                    }
                )
            });
        }
    }
}

let updateAnEmployeeRole = function() {

}

initializeApp();