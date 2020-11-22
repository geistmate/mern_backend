const { v4: uuidV4 } = require("uuid");
const { validationResult } = require("express-validator");

const HttpError = require("../models/http-error");
const Place = require("../models/place");

let DUMMY_PLACES = [
  {
    id: "p1",
    title: "Empire State Building",
    description: "One of the most famous skyscrapers in the world!",
    location: {
      lat: 40.7484474,
      lng: -73.9871516,
    },
    address: "20 W 34th St, New York, NY 10001",
    creator: "u1",
  },
];

const getPlaceById = async (req, res, next) => {
  const placeId = req.params.pid;

  // const place = DUMMY_PLACES.find((p) => {
  //   return p.id === placeId;
  // });

  // Does not return a promise. If you need a promise, you can link with .exec(). We can still use async await without .exec().
  // findByID might take a while, so we want to change getPlaceById to an async function.

  // We want to define place out here so if we don't find a place, we can read it down at -> if (!place).
  let place;

  try {
    place = await Place.findById(placeId);
  } catch (err) {
    const error = new HttpError("Something went wrong, could not find a place with that ID.", 500);
    return next(error);
  }

  // if (!place) {
  //   return next(new HttpError("Could not find a place for the provided user id.", 404));
  // }

  if (!place) {
    const error = new HttpError("Could not find a place for the provided user id.", 404);
    return next(error);
  }

  // place is a mongoose object, so we want to turn it into a javascript object by using .toObject. Setting getters: true removes the underscore from the id that is created in MongoDB.
  res.json({ place: place.toObject({ getters: true }) }); // => javascript short: if name of property is same as variale, you can shorten it like this. {place} => {place: place}
};

// Again since we have a find operation, we need to add async and add await in front of Place model.
const getPlacesByUserId = async (req, res, next) => {
  const userId = req.params.uid;

  // const places = DUMMY_PLACES.filter((p) => {
  //   return p.creator === userId;
  // });

  // Find works like findById. Using find like this [ .find() ] would return ALL places. We have to add creator: as an argument.
  // Find is available in both mongodb and mongoose. in mongodb, find returns a CURSOR. A cursor points to the results of our find method (our query) and allows us
  // to iterate through all the results we have. I.e. if we have HUNDREWDS of places. tldr;
  // In mongoose, we do not get a cursor but we get an array. If we want a cursor, we can use the .cursor() method.
  let places;

  try {
    places = await Place.find({ creator: userId });
  } catch (err) {
    const error = new HttpError("Fetching places failed, please try again later.", 500);
    return next(error);
  }

  if (!places || places.length === 0) {
    return next(new HttpError("Could not find places for the provided user id.", 404));
  }

  // Our response has to be adjusted because we have to add a method to our places. We can't use .toObject, because .find() returns an array and we can't use toObject on an array.
  // Therefore, we have to use .map()
  // res.json({ places });
  res.json({ places: places.map((place) => place.toObject({ getters: true })) });
};

const createPlace = async (req, res, next) => {
  // This looks into the request object and checks if there are any validation errors that would have been detected from the middleware.
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    console.log(errors);
    return next(new HttpError("Invalid inputs passed, please check your data.", 422));
  }

  const { title, description, coordinates, address, creator } = req.body;
  // This is a shortcut for doing const title = req.body.title ... for every property.
  // const createdPlace = {
  //   id: uuidV4(),
  //   title,
  //   description,
  //   location: coordinates,
  //   address,
  //   creator,
  // };

  const createdPlace = new Place({
    title,
    description,
    address,
    location: coordinates,
    image: "https://learnberry.com/images/logo.png",
    creator,
  });

  // DUMMY_PLACES.push(createdPlace);

  //Method available in mongoose and handles all mongodb code to store new database into collection. Also creates new unique ID. Save is also a promise.

  try {
    await createdPlace.save();
  } catch (err) {
    const error = new HttpError("Creating place failed, please try again.", 500);
    // Have to add this to stop code execution in case we have an error. If we don't have this, code execution woudl condinue even if we have an error.
    return next(error);
  }

  res.status(201).json({ place: createdPlace });
};

const updatePlace = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    console.log(errors);
    return next(new HttpError("Invalid inputs passed, please check your data.", 422));
  }

  const { title, description } = req.body;
  const placeId = req.params.pid;

  // const updatedPlace = { ...DUMMY_PLACES.find((p) => p.id == placeId) };
  // const placeIndex = DUMMY_PLACES.findIndex((p) => p.id === placeId);

  // We want to get place by ID and then update title and description. We can use our getPlacebyId method.

  let place;
  try {
    place = await Place.findById(placeId);
  } catch (err) {
    const error = new HttpError("Something went wrong, could not update place.", 500);
    return next(error);
  }

  // updatedPlace.title = title;
  // updatedPlace.description = description;

  place.title = title;
  place.description = description;

  // Now we need to store the updated place. Need to make sure that the updated information is stored in teh database, so we can use .save() method. It is asycn, so we need to use
  // try catch.
  try {
    await place.save();
  } catch (err) {
    const error = new HttpError("Something went wrong, could not update place.", 500);
    return next(error);
  }

  // DUMMY_PLACES[placeIndex] = updatedPlace;

  // Finally need to update javascript ojbect and get rid of underscore in the ID.
  // res.status(200).json({ place: updatedPlace });
  res.status(200).json({ place: place.toObject({ getters: true }) });
};

const deletePlace = async (req, res, next) => {
  const placeId = req.params.pid;

  // if (!DUMMY_PLACES.find((p) => p.id === placeId)) {
  //   throw new HttpError("Could not find a place for that ID.", 404);
  // }

  // DUMMY_PLACES = DUMMY_PLACES.filter((p) => {
  //   return p.id !== placeId;
  // });

  let place;
  try {
    place = await Place.findById(placeId);
  } catch (err) {
    const error = new HttpError("Something went wrong, could not delete place.", 500);
    return next(error);
  }

  try {
    await place.remove();
  } catch (err) {
    const error = new HttpError("Something went wrong, could not delete place", 500);
    return next(error);
  }

  res.status(200).json({ message: "Deleted place." });
};

exports.getPlacebyId = getPlaceById;
exports.getPlacesByUserId = getPlacesByUserId;
exports.createPlace = createPlace;
exports.updatePlace = updatePlace;
exports.deletePlace = deletePlace;
