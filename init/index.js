const mongoose = require("mongoose");
const initData = require("./data.js");
const Listing = require("../models/listing.js");
const User = require("../models/user.js");

const MONGO_URL = `mongodb://127.0.0.1:27017/wanderlust`;

main()
  .then(() => {
    console.log(`DB CONNECTED!`);
  })
  .catch((err) => {
    console.log(err);
  });

async function main() {
  await mongoose.connect(MONGO_URL);
}

const initDB = async () => {
  await Listing.deleteMany({});

  const demoUser = await createDemoUser();

  initData.data = initData.data.map((obj) => ({
    ...obj,
    owner: demoUser._id,
  }));

  await Listing.insertMany(initData.data);

  console.log("Data was initialized");
};

// const initDB = async () => {
//   await Listing.deleteMany({});
//   initData.data = initData.data.map((obj) => ({
//     ...obj,
//     owner: "65eca1a8127a260295fca0d7",
//   }));
//   await Listing.insertMany(initData.data);
//   console.log("data was initilazing");
// };

const createDemoUser = async () => {
  const existingUser = await User.findOne({ username: "demoUser" });

  if (!existingUser) {
    const demoUser = new User({
      username: "demoUser",
      email: "demo@example.com"
    });

    await User.register(demoUser, "demo123");
    console.log("Demo user created");
  } else {
    console.log("Demo user already exists");
  }

  return await User.findOne({ username: "demoUser" });
};

initDB();
