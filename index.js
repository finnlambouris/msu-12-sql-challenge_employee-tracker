handlePrompting = function() {
  let getLogoText = async function() {
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
        
      } else if (employeeManager.options === "View All Roles") {

      } else if (employeeManager.options === "View All Employees") {

      } else if (employeeManager.options === "Add a Department") {

      } else if (employeeManager.options === "Add A Role") {

      } else if (employeeManager.options === "Add An Employee") {

      } else if (employeeManager.options === "Update An Employee Role") {
        
      }
  }
}