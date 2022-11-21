require("dotenv").config();
const mongoose = require("mongoose");
mongoose.connect(process.env.MONGO_URI);

let personSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  age: Number,
  favoriteFoods: [String],
});
let Person = mongoose.model("Person", personSchema);

const createAndSavePerson = (done) => {
  let johnDoe = new Person({
    name: "John Doe",
    age: 33,
    favoriteFoods: ["bread", "cheese", "milk"],
  });
  johnDoe.save((err, data) => {
    if (err) return console.error(err);
    done(null, data);
  });
};
const arrayOfPeople = [
  { name: "Jane Doe", age: 30, favoriteFoods: ["toats", "tea"] },
  { name: "Kevin Costner", age: 60, favoriteFoods: ["coffee", "eggs"] },
];

const createManyPeople = (arrayOfPeople, done) => {
  Person.create(arrayOfPeople, (err, data) => {
    if (err) return console.error(err);
    done(null, data);
  });
};

const findPeopleByName = (personName, done) => {
  Person.find({ name: personName }, (err, personFound) => {
    if (err) return console.error(err);
    done(null, personFound);
  });
};

const findOneByFood = (food, done) => {
  Person.findOne({ favoriteFoods: food }, (err, personFound) => {
    if (err) return concole.error(err);
    done(null, personFound);
  });
};

const findPersonById = (personId, done) => {
  Person.findById(personId, (err, personFound) => {
    if (err) return console.error(err);
    done(null, personFound);
  });
};

const findEditThenSave = (personId, done) => {
  const foodToAdd = "hamburger";
  Person.findById(personId, (err, personFound) => {
    if (err) return console.error(err);
    personFound.favoriteFoods.push(foodToAdd);
    personFound.save((err2, updatedPerson) => {
      if (err2) concole.error(err2);
      done(null, updatedPerson);
    });
  });
};

const findAndUpdate = (personName, done) => {
  const ageToSet = 20;
  Person.findOneAndUpdate(
    { name: personName },
    { age: ageToSet },
    { new: true },
    (err, updatedPerson) => {
      if (err) console.error(err);
      done(null, updatedPerson);
    }
  );
};

const removeById = (personId, done) => {
  Person.findByIdAndRemove(personId, (err, personToRemove) => {
    if (err) return console.error(err);
    done(null, personToRemove);
  });
};

const removeManyPeople = (done) => {
  const nameToRemove = "Mary";
  Person.remove({ name: nameToRemove }, (err, removedDocs) => {
    if (err) return console.error(err);
    done(null, removedDocs);
  });
};

const queryChain = (done) => {
  const foodToSearch = "burrito";
  Person.find({ favoriteFoods: foodToSearch })
    .sort({ name: 1 })
    .limit(2)
    .select({ age: 0 })
    .exec((err, data) => {
      if (err) return console.error(err);
      done(null, data);
    });
};
