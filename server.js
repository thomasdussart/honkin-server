const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

require("dotenv").config();
require("./config/database").connect();

const User = require("./model/user");
const Parking = require("./model/parkings");
const auth = require("./middleware/auth");

const parkings = require("./data/parkings.json");

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(cookieParser());

// allow cors requests from any origin and with credentials
app.use(
  cors({
    origin: (origin, callback) => callback(null, true),
    credentials: true,
  })
);

app.get("/parkings", (req, res) => {
  res.send(parkings);
});

app.post("/addParking", (req, res) => {
  try {
  const { nomPlace, adresse, codePostal, ville, coordinates } = req.body;
  const newParking = await parkings.create({
    fields: {
        nomPlace,
        adresse,
        codePostal,
        ville,
    },
    geometry: {
        coordinates,
    },
    
});
    res.status(201).json(newParking);
  } catch (err) {
    console.log(err);
  }
});

app.post("/welcome", auth, (req, res) => {
  res.status(200).send("Welcome 🙌 ");
});

// Register
app.post("/register", async (req, res) => {
  // Our register logic starts here
  try {
    // Get user input
    const { firstName, lastName, email, password } = req.body;

    // Validate user input
    if (!(email && password && firstName && lastName)) {
      res.status(400).send("All inputs are required");
    }

    // check if user already exist
    // Validate if user exist in our database
    const oldUser = await User.findOne({ email });

    if (oldUser) {
      return res.status(409).send("User Already Exist. Please Login");
    }

    //Encrypt user password
    encryptedPassword = await bcrypt.hash(password, 10);

    // Create user in our database
    const user = await User.create({
      firstName,
      lastName,
      email: email.toLowerCase(), // sanitize: convert email to lowercase
      password: encryptedPassword,
    });

    // Create token
    const token = jwt.sign(
      { user_id: user._id, email },
      process.env.TOKEN_KEY,
      {
        expiresIn: "2h",
      }
    );
    // save user token
    user.token = token;

    // return new user
    res.status(201).json(user);
  } catch (err) {
    console.log(err);
  }
  // Our register logic ends here
});

// Login
app.post("/login", async (req, res) => {
  // Our login logic starts here
  try {
    // Get user input
    const { email, password } = req.body;

    // Validate user input
    if (!(email && password)) {
      res.status(400).send("All inputs are required");
    }
    // Validate if user exist in our database
    const user = await User.findOne({ email });

    if (user && (await bcrypt.compare(password, user.password))) {
      // Create token
      const token = jwt.sign(
        { user_id: user._id, email },
        process.env.TOKEN_KEY,
        {
          expiresIn: "2h",
        }
      );

      // save user token
      user.token = token;

      // user
      res.status(200).json(user);
    }
    console.log(user);
    res.status(400).json({
      message: "Nom d'utilisateur ou mot de passe incorrect",
    });
  } catch (err) {
    console.log(err);
  }
  // Our login logic ends here
});

// start server
// const port =
//   process.env.NODE_ENV === "production" ? process.env.PORT || 80 : 4000;
// app.listen(port, () => {
//   console.log("Server listening on port " + port);
// });

//heroku
const server_port = process.env.YOUR_PORT || process.env.PORT || 8080;
const server_host = process.env.YOUR_HOST || "0.0.0.0";
app.listen(server_port, server_host, () => {
  console.log("Listening on port %d", server_port);
});
