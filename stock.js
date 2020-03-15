const inquirer = require("inquirer");
const mysql = require("mysql");


//connection info 
let connection = mysql.createConnection({
  host: "localhost",
  port: 3306,
  user: "root",
  password: "root",
  database: "bamazon_db"
});

//letting the manager know that connection was made and welcoming to stock side!

connection.connect(function(err) {
  if (err) throw err;
  console.log("Welcome to my Bamazon store management side - you are connected!");
  //now we have a start function which will display the options for the users using inquirer 
  start();
});

function start() {
  inquirer
    .prompt([
      {
        name: "choice",
        type: "list",
        message: "Choose your action.",
        choices: [
          "Look at products",
          "View low inventory",
          "Add to Inventory",
          "Add a new product",
          "Start over"
        ]
      }
    ])

    // got some nice switch cases which are my second favorite each has their respective function

    .then(function(data) {
      switch (data.choice) {
        case "Look at products":
          lookAtProducts();
          break;
        case "View low inventory":
          viewLowInventory();
          break;
        case "Add to Inventory":
          addToInventory();
          break;
        case "Add a new product":
          addANewProduct();
          break;
        case "Start over":
          start();
          break;
        default:
          console.log("Please make a valid selection");
          start();
          break;
      }
    });
}

// function which allows the user to view the products dispays all info from database
function lookAtProducts() {
  connection.query(`SELECT * FROM bamazon_db.products`, function(err, res) {
    if (err) throw err;
    console.log("-------------------------------\n--------------------");
    console.table(res);
    console.log("---------------------------\n--------------------");
    // once they see the info they need the options again so good ole start function 
    start();
  });
}
// function to sort specifically by low inventory items currently it is set to less than 10 items
//an improvement could be to allow the user to sellect the quanity they would want to search by could get user input and place in a placeholder 
function viewLowInventory() {
  connection.query(
    "SELECT * FROM products WHERE stock_quantity < 10 ",
    function(err, res) {
      if (err) throw err;

      console.log("Here are all the items that have a quantity of 10 or less.");
      console.log("\n");
      console.table(res);
      console.log("\n");
      console.log("-----------------------------------");
          // once they see the info they need the options again so good ole start function 
      start();
    }
  );
}
// add a prodcut function 
function addANewProduct() {
  connection.query("SELECT * FROM products", function(err, res) {
    if (err) throw err;

    //gather user input using inquirer 

    inquirer
      .prompt([
        {
          type: "input",
          name: "item",
          message: "What is the product?"
        },
        {
          type: "input",
          name: "department",
          message: "What department does this belong to? "
        },
        {
          type: "input",
          name: "price",
          message: "How much does this product cost?"
        },
        {
          type: "input",
          name: "quantity",
          message: "How many items?"
        },
        {
          type: "input",
          name: "id",
          message: "Create an unique id for the item please"
        }
      ])

      // take that data and send it into the database 
      //an improvement can be to select if the product is already in the database or not but time constraint 
      .then(function(data) {
        console.log("Adding new item.\n");
        var query = connection.query(
          "INSERT INTO products SET ?",
          {
            id: data.id,
            product_name: data.item,
            department_name: data.department,
            price: data.price,
            stock_quantity: data.quantity
          },
          function(err, res) {
            if (err) throw err;
            console.log(res.affectedRows + " success! \n Product inserted!\n");

            console.log("All Products\n");

            connection.query("SELECT * FROM products", function(err, res) {
              if (err) throw err;
              console.table(res);
              start();
            });
          }
        );
      });
  });
}
//here we are adding to inventory 
function addToInventory() {
  connection.query("SELECT * FROM products", function(err, res) {
    if (err) throw err;
    console.table(res);
//similar to the customer side we got the list of items we are allowing the user to check which they would like via inquirer 
    var resList = [];

    for (var i = 0; i < res.length; i++) {
      resList.push(res[i].product_name);
    }

    inquirer
      .prompt([
        {
          name: "choice",
          type: "rawlist",
          choices: resList,
          message: "Which item would you like to add inventory to?"
        },
        {
          type: "input",
          name: "amount",
          message: "Please enter how many?",

          //got to make sure they enter a number!
          validate: function(value) {
            if (isNaN(value) === false) {
              return true;
            } else {
                //we let them know they didn't enter a number 
              console.log("\n\nPlease enter a number!!\n\n");
              return false;
            }
          }
        }
      ])
      //got the user choice and letting it match our database 
      .then(function(data) {
        var chosenItem;
        for (var i = 0; i < res.length; i++) {
          if (res[i].product_name === data.choice) {
            chosenItem = res[i];
          }
        }
// math to add to the ammount of that item
        let amount =
          parseInt(data.amount) + parseInt(chosenItem.stock_quantity);
// again similar to customer side got some nice place holders to updatethe item and the ammount 
        connection.query(
          "UPDATE products SET ? WHERE ?",
          [
            {
              stock_quantity: amount
            },
            {
              product_name: data.choice
            }
          ],
          function(error) {
            if (error) throw err;
            //everyone needs some reassurance so we let them know we updated it and show them then we start over 
            console.log("Amount is updated!\n");
            

         

            start();
          }
        );
      }); 
  }); 
}
