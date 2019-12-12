
DROP DATABASE IF EXISTS bamazon_db;
CREATE DATABASE bamazon_DB;

USE bamazon_DB;


CREATE TABLE products(
  id INT NOT NULL AUTO_INCREMENT,
  product_name VARCHAR(100) NOT NULL,
  department_name VARCHAR(45) NOT NULL,
  price INT default (50),
  stock_quantity INT (50),
  PRIMARY KEY (id)
);

INSERT INTO products (id, product_name, department_name, price, stock_quantity)
VALUES (1, "Air Fryer", "Kitchen", 89 , 8),
        (2, "iRobot Roomba", "Appliance", 349 , 5),
        (3, "Keyboard", "Electronics", 99 , 10),
        (4, "Gigapet", "Toys", 9 , 24),
        (5, "Ink Joy Pens", "Office Supplies", 8 , 11),
        (6, "Pull-up Bar", "Sports", 24 , 24),
        (7, "Socks", "Clothing", 3 , 32),
        (8, "Space Heater", "Appliances", 19 , 17),
        (9, "Table", "Furniture", 49 , 10),
        (10, "Mobile Phone", "Electronics", 75 , 44); 