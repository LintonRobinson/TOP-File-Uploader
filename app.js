const express = require("express");
const app = express();
const PORT = process.env.PORT;
const path = require("node:path");
const { PrismaSessionStore } = require("@quixo3/prisma-session-store");
const session = require("express-session");
const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
const bcrypt = require("bcryptjs");
const prisma = require("./lib/prisma.js");

const methodOverride = require("method-override");
const cookieParser = require("cookie-parser");

// Routers
const authRouter = require("./routes/authRouter.js");
const folderRouter = require("./routes/folderRouter.js");
const fileRouter = require("./routes/fileRouter.js");

// Middleware Imports
const requireAuth = require("./middleware/requireAuth.js");

// SSR View / View Ingine  Configuration
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

// SSR Static Asset Configuration
const assetsPath = path.join(__dirname, "public");
app.use(express.static(assetsPath));

// Parse Form Input Values and Return Variables With Names
app.use(express.urlencoded({ extended: true }));

// Override HTML form methods
app.use(methodOverride("_method"));

// Parses the Cookie header on incoming requests and populates req.cookies with the key-value pairs, no manual parsing needed.
app.use(cookieParser());

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

app.get("/dashboard", async (req, res) => {
  if (req.isAuthenticated()) {
    res.locals.homePath = true;
    const userFolders = await prisma.folder.findMany({ where: { user_id: req.user.id } });
    if (Object.hasOwn(req.query, "show_create_folder")) {
      res.render("pages/dashboard", { showCreateFolder: true, userFolders: userFolders });
    } else if (Object.hasOwn(req.query, "show_upload_files")) {
      res.render("pages/dashboard", { showUploadFiles: true, userFolders: userFolders });
    } else {
      res.render("pages/dashboard", { userFolders: userFolders });
    }
  } else {
    res.redirect("/");
  }
});

app.use("/auth", authRouter);

app.use("/folder", folderRouter);

app.use("/file", requireAuth.isAuthenticated, fileRouter);

app.get("/back", (req, res) => {
  const backUrl = req.get("Referrer");
  const isSameOrigin = backUrl && new URL(backUrl).origin === req.get("origin") ? req.protocol + "://" + req.get("host") : null;
  const safeUrl = backUrl && backUrl.startsWith(`${req.protocol}://${req.get("host")}`) ? backUrl : "/";
  res.redirect(safeUrl);
});

// No Path Found Error Fallback
app.use((req, res, next) => {
  res.status(404).render("pages/error-page");
});

// Errors forwarded by next(err)
app.use(async (err, req, res, next) => {
  console.error(err);

  if (err instanceof multer.MulterError) {
    const userFolders = await prisma.folder.findMany({ where: { user_id: req.user.id } });

    return res.render("pages/dashboard", { showUploadFiles: true, multerError: err.message, userFolders: userFolders });
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
