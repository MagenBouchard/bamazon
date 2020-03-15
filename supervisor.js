const inquirer = require("inquirer");
const mysql = require("mysql");

//connection info
const connection = mysql.createConnection({
  host: "localhost",
  port: 3306,
  user: "root",
  password: "root",
  database: "supervisor_db"
});

connection.connect(function(err) {
  if (err) throw err;
  console.log(
    "Welcome to my Bamazon store - you are connected \n Look at the items we have below!"
  );
  // letting the user know that they are connected and the start function displays items in database
  start();
});

function start() {
  connection.query("SELECT * FROM departments ", function(err, res) {
    if (err) throw err;
    console.log("----------------------------------------------\n");
    console.log(res)

    var table = new Table(res);


    console.log("----------------------------------------------\n");
  });
}
