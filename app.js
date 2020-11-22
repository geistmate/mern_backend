const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");

const placesRoutes = require("./routes/places-routes");
const usersRoutes = require("./routes/users-routes");
const HttpError = require("./models/http-error");
const { route } = require("./routes/places-routes");
const app = express();

app.use(bodyParser.json());

app.use("/api/places", placesRoutes);

app.use("/api/users", usersRoutes);

// This runs only if we didn't send the response in one of our routes before.
app.use((req, res, next) => {
  const error = new HttpError("Could not find route.", 404);
  throw error;
});   

app.use((error, req, res, next) => {
  if (res.headerSent) {
    return next(error);
  }

  // Check if on the error object, there is a code property. And if that is not undefined. If we don't have it, we'll fall back to 500 indicating a server error.
  res.status(error.code || 500);
  res.json({ message: error.message || "An unknown error occured!" });
});

mongoose
  .connect("mongodb+srv://testadmin:IWoefshdfh39dfP@cluster0.zlfw2.mongodb.net/places?retryWrites=true&w=majority")
  .then(() => {
    app.listen(5000);
  })
  .catch((err) => {
    console.log(err);
  });
