const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const pool = require("./config");
const { response, request } = require("express");

const app = express();
const port = 3010;

app.use(bodyParser.json());
app.use(cors());

app.get("/products", (req, res) => {
  pool.query(
    "SELECT product_id,name,price,image FROM products",
    (error, result) => {
      if (error) throw error;

      res.send(result);
    }
  );
});

app.get("/products/:id", (req, res) => {
  const product_id = req.params.id;
  pool.query(
    "SELECT * FROM products WHERE product_id = ?",
    product_id,
    (error, result) => {
      if (error) throw error;
      res.send(result);
    }
  );
});

app.get("/orders/:user_id", (req, res) => {
  const userId = req.params.user_id;
  pool.query(
    "SELECT * FROM orders INNER JOIN orders_status ON orders.status_id=orders_status.order_status_id and orders.client_id = ? order  by orders.order_id desc",
    userId,
    (error, result) => {
      if (error) throw error;
      res.send(result);
    }
  );
});

app.get("/order/:id", (req, res) => {
  const order_id = req.params.id;
  const pay = {};
  pool.query(
    "select name, products_in_order.quantity, products.price from products inner join products_in_order on products.product_id = products_in_order.products_product_id where products_in_order.orders_order_id =  ?; select status_id from orders where order_id = ?",
    [order_id, order_id],
    (error, result) => {
      if (error) throw error;

      res.send(result);
    }
  );
});

app.get("/cart/:client_id", (req, res) => {
  const client_id = req.params.client_id;
  pool.query(
    "SELECT cart.product_id,cart.quantity,price,image,name from cart inner join products on cart.product_id=products.product_id and cart.client_id=?",
    client_id,
    (error, result) => {
      if (error) throw error;

      res.send(result);
    }
  );
});
// Создание нового пользователя

app.get("/users/:parol/:email", (req, res) => {
  const email = req.params.email;
  const parol = req.params.parol;
  pool.query(
    "SELECT client_id, name FROM clients WHERE parol = ? AND login = ?",
    [parol, email],
    (error, result) => {
      res.send(result);
    }
  );
});

app.post("/cart", (req, res) => {
  const client_id = req.body.client_id;
  const product_id = req.body.product_id;
  pool.query(
    "call add_item_to_cart(?,?)",
    [client_id, product_id],
    (error, result) => res.send(result)
  );
});

app.post("/orders", (req, res) => {
  const client_id = req.body.client_id;

  console.log("CREATE ORDER");
  pool.query(
    "call create_new_order(?)",
    client_id,
    (error, result) => {
      res.send(result);
    }
  );
});

app.put("/cart", (req, res) => {
  const client_id = req.body.client_id;
  const product_id = req.body.product_id;
  const decrease_mode = req.body.decrease_mode;
  console.log(req.body);

  if (decrease_mode) {
    pool.query(
      "Start transaction; update cart set quantity = quantity - 1 where client_id = ? and product_id = ?; delete from cart where quantity <= 0 and client_id = ?; commit;",
      [client_id, product_id, client_id],
      (error, result) => {
        res.send(result);
      }
    );
  } else {
    console.log("ADD ITEM TO CART");
    pool.query(
      "UPDATE cart SET quantity = quantity + 1 WHERE client_id = ? AND product_id = ?",
      [client_id, product_id],
      (error, result) => {
        res.send(result);
      }
    );
  }
});

app.delete("/cart", (req, res) => {
  const client_id = req.body.client_id;
  const product_id = req.body.product_id;
  console.log(req.body);

  if (!product_id) {
    pool.query(
      "DELETE FROM cart WHERE client_id = ?",
      client_id,
      (error, result) => {
        res.send(result);
      }
    );
  } else {
    pool.query(
      "DELETE FROM cart WHERE client_id = ? and product_id = ?",
      [client_id, product_id],
      (error, result) => {
        res.send(result);
      }
    );
  }
});

app.put("/orders/:id", (req, res) => {
  const order_id = req.params.id;
  pool.query(
    "UPDATE orders SET status_id = 2 WHERE order_id = ?",
    order_id,
    (error, result) => {
      res.send(result);
    }
  );
});

app.listen(port, () => {
  console.log(`LISTEN PORT: ${port}`);
});
