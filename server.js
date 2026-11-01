require("dotenv").config();

const express = require("express");
const fs = require("fs");
const path = require("path");
const { MongoClient } = require("mongodb");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const app = express();
const PORT = process.env.PORT || 3000;
const DATA_FILE = path.join(__dirname, "database.json");

// MongoDB Atlas
const mongoClient = new MongoClient(process.env.MONGODB_URI);
let usersCollection;

/* =========================================================
   MIDDLEWARE
========================================================= */

app.use(express.json());
app.use(express.static(__dirname));

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});

app.use(express.static(path.join(__dirname, "public")));

/* =========================================================
   MONGODB ATLAS
========================================================= */

async function connectMongoDB() {
  await mongoClient.connect();

  const database = mongoClient.db("the_chums");
  usersCollection = database.collection("users");

  // Prevent duplicate accounts with the same email.
  await usersCollection.createIndex(
    { email: 1 },
    { unique: true }
  );

  console.log("Connected to MongoDB Atlas");
}

/* =========================================================
   EXISTING JSON DATABASE
   Kept for your current bank and cafe features.
========================================================= */

function defaultDatabase() {
  return {
    users: [
      {
        id: "101",
        name: "Rahul Sharma",
        pin: "1234",
        balance: 5000,
        history: []
      },
      {
        id: "102",
        name: "Priya Singh",
        pin: "5678",
        balance: 10000,
        history: []
      }
    ],

    cafe: {
      revenue: 0,
      sessions: [],
      reservations: [],
      bills: []
    }
  };
}

function getDatabase() {
  if (!fs.existsSync(DATA_FILE)) {
    const data = defaultDatabase();

    fs.writeFileSync(
      DATA_FILE,
      JSON.stringify(data, null, 2)
    );
  }

  try {
    return JSON.parse(
      fs.readFileSync(DATA_FILE, "utf8")
    );
  } catch (error) {
    const data = defaultDatabase();

    fs.writeFileSync(
      DATA_FILE,
      JSON.stringify(data, null, 2)
    );

    return data;
  }
}

function saveDatabase(data) {
  fs.writeFileSync(
    DATA_FILE,
    JSON.stringify(data, null, 2)
  );
}

/* =========================================================
   HEALTH CHECK
========================================================= */

app.get("/api/health", (req, res) => {
  res.json({
    success: true,
    message: "The Chums server is running",
    time: new Date().toISOString()
  });
});

/* =========================================================
   CUSTOMER SIGNUP — MONGODB ATLAS
========================================================= */

app.post("/api/auth/signup", async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (
      typeof name !== "string" ||
      typeof email !== "string" ||
      typeof password !== "string" ||
      !name.trim() ||
      !email.trim() ||
      !password
    ) {
      return res.status(400).json({
        success: false,
        message: "Name, email and password are required."
      });
    }

    if (password.length < 8) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 8 characters."
      });
    }

    const normalizedEmail = email.trim().toLowerCase();

    const passwordHash = await bcrypt.hash(password, 12);

    const result = await usersCollection.insertOne({
      name: name.trim(),
      email: normalizedEmail,
      passwordHash,
      createdAt: new Date()
    });

    const token = jwt.sign(
      { userId: result.insertedId.toString() },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    return res.status(201).json({
      success: true,
      message: "Account created successfully.",
      token,
      user: {
        id: result.insertedId.toString(),
        name: name.trim(),
        email: normalizedEmail
      }
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: "An account with this email already exists."
      });
    }

    console.error("Signup error:", error);

    return res.status(500).json({
      success: false,
      message: "Could not create account."
    });
  }
});

/* =========================================================
   CUSTOMER LOGIN — EMAIL AND PASSWORD
========================================================= */

app.post("/api/auth/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (
      typeof email !== "string" ||
      typeof password !== "string" ||
      !email.trim() ||
      !password
    ) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required."
      });
    }

    const user = await usersCollection.findOne({
      email: email.trim().toLowerCase()
    });

    if (
      !user ||
      !(await bcrypt.compare(password, user.passwordHash))
    ) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password."
      });
    }

    const token = jwt.sign(
      { userId: user._id.toString() },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    return res.json({
      success: true,
      message: "Login successful.",
      token,
      user: {
        id: user._id.toString(),
        name: user.name,
        email: user.email
      }
    });
  } catch (error) {
    console.error("Login error:", error);

    return res.status(500).json({
      success: false,
      message: "Could not log in."
    });
  }
});

/* =========================================================
   EXISTING CUSTOMER LOGIN — ACCOUNT NUMBER AND PIN
========================================================= */

app.post("/api/user/login", (req, res) => {
  const { accNo, pin } = req.body;
  const db = getDatabase();

  const user = db.users.find(
    u => u.id === accNo && u.pin === pin
  );

  if (!user) {
    return res.json({
      success: false,
      message: "Invalid Account Number or PIN"
    });
  }

  res.json({
    success: true,
    user
  });
});

/* =========================================================
   EXISTING BANK TRANSACTION
========================================================= */

app.post("/api/user/transaction", (req, res) => {
  const { accNo, type, amount } = req.body;
  const db = getDatabase();

  const user = db.users.find(u => u.id === accNo);

  if (!user) {
    return res.json({
      success: false,
      message: "User not found"
    });
  }

  const amt = Number(amount);

  if (!Number.isFinite(amt) || amt <= 0) {
    return res.json({
      success: false,
      message: "Invalid amount"
    });
  }

  if (type === "withdraw" && user.balance < amt) {
    return res.json({
      success: false,
      message: "Insufficient balance"
    });
  }

  if (type === "deposit") {
    user.balance += amt;
    user.history.push(
      `Deposited ₹${amt} on ${new Date().toLocaleString()}`
    );
  } else if (type === "withdraw") {
    user.balance -= amt;
    user.history.push(
      `Withdrawn ₹${amt} on ${new Date().toLocaleString()}`
    );
  } else {
    return res.json({
      success: false,
      message: "Invalid transaction type"
    });
  }

  saveDatabase(db);

  res.json({
    success: true,
    user
  });
});

/* =========================================================
   EXISTING ADMIN LOGIN
   Retained so existing features are not removed.
========================================================= */

app.post("/api/admin/login", (req, res) => {
  const { username, password } = req.body;

  if (username !== "admin" || password !== "admin123") {
    return res.json({
      success: false,
      message: "Invalid admin credentials"
    });
  }

  const db = getDatabase();

  res.json({
    success: true,
    users: db.users,
    cafe: db.cafe
  });
});

/* =========================================================
   EXISTING ADMIN DATA
========================================================= */

app.get("/api/admin/all-data", (req, res) => {
  const db = getDatabase();

  res.json({
    success: true,
    users: db.users,
    cafe: db.cafe
  });
});

/* =========================================================
   EXISTING CAFE DATA SYNC
========================================================= */

app.post("/api/cafe/sync", (req, res) => {
  const db = getDatabase();

  const {
    sessions,
    reservations,
    revenue,
    bills
  } = req.body;

  if (Array.isArray(sessions)) {
    db.cafe.sessions = sessions;
  }

  if (Array.isArray(reservations)) {
    db.cafe.reservations = reservations;
  }

  if (Array.isArray(bills)) {
    db.cafe.bills = bills;
  }

  if (Number.isFinite(Number(revenue))) {
    db.cafe.revenue = Number(revenue);
  }

  saveDatabase(db);

  res.json({
    success: true,
    message: "Cafe data saved successfully"
  });
});

/* =========================================================
   EXISTING CREATE BILL
========================================================= */

app.post("/api/cafe/bill", (req, res) => {
  const db = getDatabase();
  const bill = req.body;

  if (!bill || !bill.customer || !bill.total) {
    return res.status(400).json({
      success: false,
      message: "Invalid bill data"
    });
  }

  bill.createdAt = new Date().toISOString();

  db.cafe.bills.push(bill);
  db.cafe.revenue += Number(bill.total) || 0;

  saveDatabase(db);

  res.json({
    success: true,
    bill
  });
});

/* =========================================================
   START SERVER
========================================================= */

async function startServer() {
  try {
    if (!process.env.MONGODB_URI) {
      throw new Error("MONGODB_URI is missing from your .env file");
    }

    if (!process.env.JWT_SECRET) {
      throw new Error("JWT_SECRET is missing from your .env file");
    }

    await connectMongoDB();

    app.listen(PORT, () => {
      console.log("=================================");
      console.log(" THE CHUMS GAMING CAFE");
      console.log(` Server running: http://localhost:${PORT}`);
      console.log("=================================");
    });
  } catch (error) {
    console.error("Server startup failed:", error);
    process.exit(1);
  }
}

startServer();