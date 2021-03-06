const { v4: uuidV4 } = require("uuid");
const { validationResult } = require("express-validator");
const HttpError = require("../models/http-error");
const User = require("../models/user");
const user = require("../models/user");

const DUMMY_USERS = [
  {
    id: "u1",
    name: "Matthew Nguyen",
    email: "test@test.com",
    password: "testers",
  },
];

const getUsers = (req, res, next) => {
  res.status(200).json({ users: DUMMY_USERS });
};

const signup = async (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    console.log(errors);
    return next(new HttpError("Invalid inputs passed, please check your data.", 422));
  }

  const { name, email, password, places } = req.body;

  // const hasUser = DUMMY_USERS.find((u) => u.email === email);
  // if (hasUser) {
  //   throw new HttpError("Could not create user, email already exists.", 422);
  // }

  let existingUser;
  try {
    existingUser = await User.findOne({ email: email });
  } catch (err) {
    const error = new HttpError("Signing up failed, please try again later.", 500);
    return next(error);
  }

  if (existingUser) {
    const error = new HttpError("User exists already, please login instead.", 422);
    return next(error);
  }

  // Now we have to adjust this to make sure we have all of the stuff defined in our User schema.

  // const createdUser = {
  //   id: uuidV4(),
  //   name, // name: name
  //   email,
  //   password,
  // };

  const createdUser = new User({
    name,
    email,
    image: "https://learnberry.com/images/logo.png",
    password,
    places,
  });

  // *SAVING DATA* //
  // DUMMY_USERS.push(createdUser);
  try {
    await createdUser.save();
  } catch (err) {
    const error = new HttpError("Signing up failed at saving, please try again later.", 500);
    return next(error);
  }

  // res.status(201).json({ user: createdUser });
  res.status(201).json({ user: createdUser.toObject({ getters: true }) });
};

const login = async (req, res, next) => {
  const { email, password } = req.body;

  // const identifiedUser = DUMMY_USERS.find((u) => u.email === email);
  // if (!identifiedUser || identifiedUser.password !== password) {
  //   throw new HttpError(
  //     "Could not identify error, credential seem sto be wrong.",
  //     401 // 401 = auth failed.
  //   );
  // }
 
  let existingUser;
  
  // Check if user exists. 

  try {
    existingUser = await User.findOne({ email: email });
  } catch (err) {
    const error = new HttpError("Logging in failed, please try again later.", 500);
    return next(error);
  }

  // Check if user email and password is correct. 
  if (!existingUser || existingUser.password !== password) {
    const error = new HttpError('Invalid credentials, could not log you in.', 401);
    return next(error);
  }
  res.json({ message: "Logged in!" });
};

exports.getUsers = getUsers;
exports.signup = signup;
exports.login = login;
