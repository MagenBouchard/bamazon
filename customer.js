const inquirer = require("inquirer");
const mysql = require("mysql");


const connection = mysql.createConnection({
  host: "localhost",
  port: 3306,
  user: "root",
  password: "root",
  database: "bamazon_db"
});

connection.connect(function(err) {
  if (err) throw err;
  console.log(
    "Welcome to my Bamazon store - you are connected \n Look at the items we have below!"
  );
  // letting the user know that they are connected and the start function displays items in database
  start();
});

// how we get rolling makes the connection to the database and displays so the customer can see
function start() {
  connection.query("SELECT * FROM products WHERE stock_quantity > 0", function(
    err,
    res
  ) {
    if (err) throw err;
    console.log("----------------------------------------------\n");
    console.table(res);
    console.log("----------------------------------------------\n");
    // we have a nice little varriable to store the array of product names so the customer can choose look through it to display entire list
    var resList = [];

    for (var i = 0; i < res.length; i++) {
      resList.push(res[i].product_name);
    }

    // reference the varriable we have above and uses it for the choices in inquire prompt
    inquirer
      .prompt([
        {
          name: "choice",
          type: "rawlist",
          choices: resList,
          message: "Please select the item you would like to buy\n"
        },
        {
          type: "input",
          name: "amount",
          message: "How many would you like to purchase?\n",
          // validates the user's response for an number
          validate: function(value) {
            if (isNaN(value) === false) {
              return true;
            } else {
              console.log("\n\nPlease enter a number!\n\n");
              return false;
            }
          }
        }
      ])
      .then(function(data) {
        // another loop in a new function got to go through that list!
        var chosenItem;
        for (var i = 0; i < res.length; i++) {
          if (res[i].product_name === data.choice) {
            chosenItem = res[i];
          }
        }
        // doing some math to get ammount correct
        if (chosenItem.stock_quantity >= parseInt(data.amount)) {
          let newQuanity = chosenItem.stock_quantity - parseInt(data.amount);
          //updating product in the database ? are place holders below we are specific
          connection.query(
            "UPDATE products SET ? WHERE ?",
            [
              {
                stock_quantity: newQuanity
              },
              {
                product_name: chosenItem.product_name
              }
            ],

            // if we get an error we will let them know!
            function(error) {
              if (error) throw err;
              // if they are trying to buy an ammount that we do not have we have to let them know
              if (parseInt(data.amount) > 1) {
                console.log(
                  // cash money jquery is my favorite
                  `You just bought!  ${data.amount} \n ${
                    chosenItem.product_name
                  }s for $${parseInt(data.amount) *
                    parseInt(chosenItem.price)}!`
                );
              } else {
                console.log(
                  `You just bought!  ${data.amount} \n ${
                    chosenItem.product_name
                  } for $${parseInt(data.amount) * parseInt(chosenItem.price)}!`
                );
              }
              // after they purchased we want them to buy more to loaded up the start function again
              start();
            }
          );
        }
        // okay now if we do not have enough the item they have choose we let them know
        if (chosenItem.stock_quantity < parseInt(data.amount)) {
          console.log(
            `OH NO! We only have  ${chosenItem.stock_quantity}.\n Not enough items are available :(.`
          );
          inquirer
            .prompt([
              {
                type: "confirm",
                message: "Would you like to purchase the rest?",
                name: "confirm"
              }
            ])

            // we know if they bought them all then inventory needs to be set to 0 and reflected in the database
            .then(function(data) {
              if (data.confirm) {
                connection.query(
                  "UPDATE products SET ? WHERE ?",
                  [
                    {
                      stock_quantity: 0
                    },
                    {
                      product_name: chosenItem.product_name
                    }
                  ],
                  function(error) {
                    if (error) throw err;

                    let plural = parseInt(data.amount) > 1 ? "s" : "";
                    // letting them know what they bought and math for the ammount
                    if (parseInt(data.amount) > 1) {
                      console.log(
                        `You just bought! ${data.amount} \n ${
                          chosenItem.product_name
                        }${plural} for $${parseInt(data.amount) *
                          parseInt(chosenItem.price)}!`
                      );
                    }
                    start();
                  }
                );
              } else console.log("----------------------------\n Sorry, check back for inventory updates! \n perhaps you would like additional itmes!\n---------------------------");

              // if they don't want to purchase the remainder then we start them over good ole start function!
              start();
            });
        }
      })
      .catch(function(error) {
        console.log(
          "!!!!!!!!!!!!!!!!!!!!!\n" + error + "\n!!!!!!!!!!!!!!!!!!!!!!"
        );
      });
  });
}
