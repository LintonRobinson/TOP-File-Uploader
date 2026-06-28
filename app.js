const path = require("node:path");
const express = require("express");
const app = express();
const session = require("express-session");
const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
const prisma = require("./lib/prisma.js");
const { PrismaSessionStore } = require("@quixo3/prisma-session-store");

// SSR Static Asset Configuration
const assetsPath = path.join(__dirname, "public");
const PORT = 3000;
app.use(express.static(assetsPath));

// SSR View / View Ingine  Configuration
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

// Parse Form Input Values and Return Variables With Names
app.use(express.urlencoded({ extended: true }));

// Override HTML form methods
const methodOverride = require("method-override");
app.use(methodOverride("_method"));

// Initialize prisma store
const prismaStore = new PrismaSessionStore({ prisma });

// User sessions
app.use(
  session({
    resave: false,
    saveUninitialized: false,
    secret: process.env.SESSION_SECRET,
    store: prismaStore,
  }),
);

app.use(passport.session());

// No Path Found Error Fallback
app.use((req, res, next) => {
  res.status(404).render("errorPage");
});

// Errors forwarded by next(err)
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).render("errorPage");
});

app
  .listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  })
  .on("error", (err) => {
    console.error("Server failed to start:", err);
  });
