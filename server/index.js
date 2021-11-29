const express = require("express");
const mysql = require("mysql");
const cors = require("cors");

const bcrypt = require("bcrypt");
const saltRounds = 10;

const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const session = require("express-session");

const jwt = require("jsonwebtoken");

const verifyJWT = (req, res, next) => {
  const token = req.headers["x-access-token"];

  if (!token) {
    res.send("We need a token, please give it next time ");
  } else {
    jwt.verify(token, "jwtSecret", (err, decoded) => {
      if (err) {
        res.json({ auth: false, message: "U failed to authenticate" });
      } else {
        req.userId = decoded.id;
        next();
      }
    });
  }
};

const app = express();
app.use(express.json());
app.use(
  cors({
    origin: "http://localhost:3000",
    methods: ["GET", "POST"],
    credentials: true,
  })
);
app.use(cookieParser());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(
  session({
    key: "userId",
    secret: "secret",
    resave: false,
    saveUninitialized: false,
    cookie: {
      expires: 60 * 60 * 24,
    },
  })
);

const db = mysql.createConnection({
  user: "root",
  host: "localhost",
  password: "newEra2019_",
  database: "TEST_DB",
});

db.connect((err) => {
  if (!err) console.log("DB connection success");
  else
    console.log(
      "DB connection fail /n Error: " + JSON.stringify(err, undefined, 2)
    );
});

app.post("/register", (req, res) => {
  const username = req.body.username;
  const password = req.body.password;

  bcrypt.hash(password, saltRounds, (err, hash) => {
    if (err) {
      console.log(err);
    }
    db.query(
      "INSERT INTO Users (username, password) VALUES (?, ?)",
      [username, hash],
      (err, row) => {
        console.log(err);
      }
    );
  });
});

app.get("/userAuth", verifyJWT, (req, res) => {
  res.send("You are authenticated!");
});

app.get("/login", (req, res) => {
  if (req.session.user) {
    res.send({ loggedIn: true, user: req.session.user });
  } else {
    res.send({ loggedIn: false });
  }
});

app.post("/login", (req, res) => {
  const username = req.body.username;
  const password = req.body.password;

  db.query("SELECT * FROM Users WHERE username = ?", username, (err, row) => {
    if (err) {
      res.send({ err: err });
    }
    if (row.length > 0) {
      bcrypt.compare(password, row[0].password, (err, result) => {
        if (result) {
          req.session.user = row;

          const id = row[0].id;
          const token = jwt.sign({ id }, "jwtSecret", {
            expiresIn: 300,
          });

          req.session.user = row;

          res.json({ auth: true, token: token, row: row });
        } else {
          res.json({ auth: false, message: "Wrong username or password!" });
        }
      });
    } else {
      res.json({ auth: false, message: "no user exists" });
    }
  });
});

app.listen(3001, () => {
  console.log("Server Running on 3001");
});
