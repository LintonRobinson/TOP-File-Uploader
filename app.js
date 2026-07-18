const path = require("node:path");
const express = require("express");
const app = express();
const session = require("express-session");
const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
const prisma = require("./lib/prisma.js");
const { PrismaSessionStore } = require("@quixo3/prisma-session-store");
const authRouter = require("./routes/authRouter.js");
const folderRouter = require("./routes/folderRouter.js");
const fileRouter = require("./routes/fileRouter.js");
const bcrypt = require("bcryptjs");

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

// Import / configure multer and assigned to upload
const multer = require("multer");
const upload = multer({ dest: "uploads/" });

// Initialize prisma store
const prismaStore = new PrismaSessionStore(prisma, { checkPeriod: 15 * 60 * 1000 });

// User sessions
app.use(
  session({
    cookie: {
      maxAge: 7 * 24 * 60 * 60 * 1000,
    },
    resave: false,
    saveUninitialized: false,
    secret: process.env.SESSION_SECRET,
    store: prismaStore,
  }),
);

app.use(passport.session());

passport.use(
  new LocalStrategy({ usernameField: "login" }, async (login, password, done) => {
    try {
      const user = await prisma.user.findFirst({ where: { OR: [{ email: login }, { username: login }] } });
      if (!user) {
        return done(null, false, { message: "Username or email does not exist" });
      }
      const matchedPassword = await bcrypt.compare(password, user.password);
      if (!matchedPassword) {
        return done(null, false, { message: "Incorrect password" });
      }
      done(null, user);
    } catch (error) {
      return done(error);
    }
  }),
);

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (userId, done) => {
  try {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    done(null, user);
  } catch (error) {
    done(null, error);
  }
});

app.use((req, res, next) => {
  if (req.isAuthenticated()) {
    res.locals.user = req.user;
  }
  next();
});

app.get("/", (req, res) => {
  if (!req.isAuthenticated()) {
    res.render("pages/home-page");
  } else {
    res.redirect("/dashboard");
  }
});

app.get("/dashboard", (req, res) => {
  if (req.isAuthenticated()) {
    if (Object.hasOwn(req.query, "show_create_folder")) {
      res.render("pages/dashboard", { showCreateFolder: true });
    } else if (Object.hasOwn(req.query, "show_upload_files")) {
      res.render("pages/dashboard", { showUploadFiles: true });
    } else {
      res.render("pages/dashboard");
    }
  } else {
    res.redirect("/");
  }
});

app.use("/auth", authRouter);

app.use("/folder", folderRouter);

app.use("/file", fileRouter);

// No Path Found Error Fallback
app.use((req, res, next) => {
  res.status(404).render("pages/error-page");
});

// Errors forwarded by next(err)
app.use((err, req, res, next) => {
  console.error(err);

  if (err instanceof multer.MulterError) {
    console.log("ooo", multer.MulterError);
    return res.render("pages/dashboard", { showUploadFiles: true, multerError: err.message });
  }

  res.status(500).render("pages/error-page");
});

app
  .listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  })
  .on("error", (err) => {
    console.error("Server failed to start:", err);
  });
