const express = require("express");
const session = require("express-session");
const helmet = require("helmet")
const cors = require("cors")
const app = express();


// const port = 3000;
const PORT = process.env.PORT || 3000;
const indexRouter = require("./routes/index");
const adminRouter = require("./routes/admin");
const productRouter = require("./routes/product");
const authRouter = require("./routes/auth");
const csrfRouter = require("./routes/csrf");
const errorHandler = require("./middlewares/errorHandler");
const loggerMiddleware = require("./middlewares/loggerMiddleware");
const csrfMiddleware = require("./middlewares/csrfMiddleware")

app.use(loggerMiddleware);
app.use(helmet());
app.use(cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true
}));
app.use(express.static("public"));
app.use(express.json());
app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,

    cookie:{
      httpOnly:true,
      secure: process.env.NODE_ENV === "production",
      sameSite:"lax",
      maxAge: 1000 * 60 * 60
    }
}));
app.use(csrfMiddleware);
app.use("/", csrfRouter);

app.use("/", indexRouter);
app.use("/admin", adminRouter);
app.use("/", productRouter);
app.use("/", authRouter);
app.use(errorHandler);


app.listen(PORT, () => {
  console.log(`Honey Store server is running on http://localhost:${PORT}`);
});

