var mysql = require("mysql")
var inquirer = require("inquirer")
var Table = require('cli-table')

var connection = mysql.createConnection({
  host: "localhost",
  port: 3000,
  user: "root",
  password: "",
  database: "bamazon"
});

connection.connect(function(err) {
  if (err) throw err;
  displayItems()
  });

// DISPLAYING THE TABLE //

function displayItems(answer) {
  var query = "SELECT item_id, product_name, price, stock_quantity FROM products";
  connection.query(query, function(err, res) {
    
  var table = new Table({
  head: ['ID', 'PRODUCT', 'PRICE', 'UNIT']
  });

  for (var i = 0; i < res.length; i++) {
      table.push(
      [res[i].item_id, res[i].product_name, res[i].price, res[i].stock_quantity]
      );
    }
      console.log(table.toString())

// CALLING FOR USER INPUT FUNCTION // 
      
    selectItem()
    });
}

// USER INPUT //

function selectItem(answer) {
  inquirer.prompt([
    {
      name: "item",
      type: "input",
      message: "What is the ID of the product you'd like to purchase?"
    },
    {
      name: "count",
      type: "input",
      message: "How many UNITS would you like to purchase?"
    }

// ACTIONS BASED ON INPUT //

  ]).then(function(answer) {
      connection.query("SELECT item_id, product_name, price, stock_quantity FROM products WHERE ?",
        {item_id: answer.item},  function(err, res) {

// ACTION IF INPUT IS HIGHER THAN AVAILABILITY //

    if (parseInt(answer.count) > res[0].stock_quantity) {

    console.log("Ooops, there's only " + res[0].stock_quantity + "in stock.");
    selectItem();
    }

// ACTION IF INPUT IS LOWER THAN AVAILABILITY //

    else {
    console.log("Your purchase of " + answer.count + ' ' + res[0].product_name +"/s total cost is: $ " + parseInt(res[0].price) * parseInt(answer.count));
    
// UPDATING QUANTITY TO MATCH RECENT TRANSACTION //

    var quantityLeft = res[0].stock_quantity - answer.count;
    console.log(quantityLeft);
    
    connection.query(
      "UPDATE products SET ? WHERE ?",
      [
        {
          stock_quantity: quantityLeft
        },
        {
          item_id: answer.item
        }
      ],
      function(error) {
      if (error) throw err;
          
// SHOW CUSTOMER UPDATED TABLE //

        }); 
      console.log("We have  " + quantityLeft + " left in the system. What else would you like to buy?"); 
      displayItems()
      }
    })
  })
}      
