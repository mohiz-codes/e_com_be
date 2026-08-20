const mongoose = require("mongoose");

async function connectDB() {
  if (!process.env.MONGO_URI) {
    throw new Error(
      "MONGO_URI is missing. Create e_com_be/.env and add MONGO_URI=your_mongodb_connection_string"
    );
  }

  await mongoose.connect(process.env.MONGO_URI);
  console.log("MongoDB connected");
}

module.exports = connectDB;
