const inquirer = require("inquirer");

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

}

let viewAllRoles = function() {
    
}

let viewAllEmployees = function() {
    
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