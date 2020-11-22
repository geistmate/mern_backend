const mongoose = require("mongoose");
const uniqueValidator = require("mongoose-unique-validator");

const Schema = mongoose.Schema;

const userSchema = new Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true }, // This creates an index for the email, which speeds up the queriying process when you request the email.
  password: { type: String, required: true, minlength: 6 },
  image: { type: String, required: true },
  places: { type: String, required: true },
});

userSchema.plugin(uniqueValidator); // This makes sure we query email as fast as possible and ensure that we can create a new user only if it doens't exist already.

module.exports = mongoose.model("User", userSchema);
