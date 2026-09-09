const express = require("express");
const app = express();
const mongoose = require("mongoose");
const port = 8080;
const path = require("path");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const ExpressError = require("./utils/ExpressError.js");
const cookieParser = require("cookie-parser");
const session = require("express-session");
const flash = require("connect-flash");
const passport = require("passport");
const LocalStrategy = require("passport-local");
const User = require("./models/user.js");

const listingRouter = require("./routes/listing.js");
const reviewRouter = require("./routes/review.js");
const userRouter = require("./routes/user.js");


// =======================
// DATABASE CONNECTION
// =======================

const MONGO_URL = `mongodb://127.0.0.1:27017/wanderlust`;

main()
    .then(() => {
        console.log("DB CONNECTED!");
    })
    .catch((err) => {
        console.log(err);
    });

async function main() {
    await mongoose.connect(MONGO_URL);
}


// =======================
// VIEW ENGINE & SETTINGS
// =======================

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));


// =======================
// MIDDLEWARE
// =======================

app.use(express.urlencoded({ extended: true }));

app.use(methodOverride("_method"));

app.engine("ejs", ejsMate);

app.use(express.static(path.join(__dirname, "/public")));

app.use(cookieParser("signedCookie"));


// =======================
// SESSION
// =======================

const sessionOptions = {
    secret: "mysupersecretcode",
    resave: false,
    saveUninitialized: true,
    cookie: {
        expires: Date.now() + 7 * 24 * 60 * 60 * 1000,
        maxAge: 7 * 24 * 60 * 60 * 1000,
        httpOnly: true,
    },
};

app.use(session(sessionOptions));


// =======================
// FLASH
// =======================

app.use(flash());


// =======================
// PASSPORT
// =======================

app.use(passport.initialize());

app.use(passport.session());

passport.use(new LocalStrategy(User.authenticate()));

passport.serializeUser(User.serializeUser());

passport.deserializeUser(User.deserializeUser());


// =======================
// RES.LOCALS
// =======================

app.use((req, res, next) => {
    res.locals.success = req.flash("success");
    res.locals.error = req.flash("error");
    res.locals.currUser = req.user;

    next();
});


// =======================
// ROOT ROUTE
// =======================

app.get("/", (req, res) => {
    res.send(`Hii I'm Root!`);
});


app.get("/test-cookie", (req, res) => {
  res.cookie("username", "Qanita");
  res.send("Cookie sent!");
});


// =======================
// ROUTERS
// =======================

app.use("/listings", listingRouter);

app.use("/listings/:id/reviews", reviewRouter);

app.use("/", userRouter);


// =======================
// ERROR HANDLING
// =======================

// 404 Error
app.all("*", (req, res, next) => {
    next(new ExpressError(404, "Page not Found!"));
});


// Error Handler
app.use((err, req, res, next) => {
    let {
        statusCode = 500,
        message = "something went wrong!"
    } = err;

    res.status(statusCode).render("error", { err });
});


// =======================
// SERVER
// =======================

app.listen(port, () => {
    console.log(`App is running on port ${port}`);
});