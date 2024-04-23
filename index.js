const inquirer = require("inquirer");
const mysql = require('mysql2');

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
        }
        console.table(result);
        initializeApp();
    });
}

let viewAllRoles = function() {
    db.query(
        `SELECT 
            role.id, 
            title,
            department.name AS "department name",
            salary
        FROM role
        INNER JOIN department
            ON role.department_id = department.id;`, (err, result) => {
        if (err) {
          console.log(err);
        }
        console.table(result);
        initializeApp();
    });
}

let viewAllEmployees = function() {
    db.query(
        `SELECT 
            employee.id,
            employee.first_name AS "first name",
            employee.last_name AS "last name",
            role.title,
            department.name AS "department name",
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
        }
        console.table(result);
        initializeApp();
      });
}

let addADepartment = function() {

}

let addARole = function() {

}

let addAnEmployee = function() {

}

let updateAnEmployeeRole = function() {

}

initializeApp();