const inquirer = require("inquirer");
const mysql = require("mysql2");
const Table = require("cli-table3");

const db = mysql.createConnection(
    {
      host: 'localhost',
      user: 'root',
      password: 'mySQLroot',
      database: 'employee_tracker'
    },
    console.log(`Connected to the employee_tracker database.`)
  );

let initializeApp = async function() {
    let employeeManager = await inquirer.prompt(
        [
            {
                name: 'options',
                type: 'list',
                message: 'What would you like to do?',
                choices: ['View All Departments', 'View All Roles', 'View All Employees', 'Add a Department', 'Add A Role', 'Add An Employee', 'Update An Employee Role']
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
    db.query("SELECT * FROM department", (err, result) => {
        if (err) {
          console.log(err);
        } else {
            const table = new Table({
                head: ["Department ID", "Department Name"]
            });

            result.forEach(row => {
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
            ON role.department_id = department.id;`, (err, result) => {
        
            if (err) {
            console.log(err);
            } else {
                const table = new Table({
                    head: ["Role ID", "Job Title", "Department Name", "Salary"]
                });

                result.forEach(row => {
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
            ON employee.manager_id = manager.id;`, (err, result) => {
        
            if (err) {
                console.log(err);
            } else {
                const table = new Table({
                    head: ["Employee ID", "First Name", "Last Name", "Job Title", "Department Name", "Salary", "Manager"]
                });

                result.forEach(row => {
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
                name: 'department',
                type: 'input',
                message: 'What is the name of the new department?',
            }
        ]
    )

    console.log(newDepartment.department);
    
    db.query(
        `INSERT INTO department (name)
        VALUES
            ("${newDepartment.department}")`,  (err, result) => {
        
            if (err) {
                console.log(err);
            } else {
                console.log(result);
                initializeApp();
            }
        }
    );
}

let addARole = function() {

}

let addAnEmployee = function() {

}

let updateAnEmployeeRole = function() {

}

initializeApp();