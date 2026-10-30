const mongoose = require("mongoose");
const dotenv = require("dotenv");

dotenv.config();

// डेटाबेस कनेक्ट करने का फंक्शन
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("MongoDB Connected Successfully via db.js 🚀");
  } catch (err) {
    console.error("MongoDB Connection Error in db.js ❌ :", err);
    process.exit(1); // एरर आने पर प्रोसेस बंद करें
  }
};

// इसे बाहर भेजें (Export करें) ताकि server.js इसे इस्तेमाल कर सके
module.exports = connectDB;




// const express = require("express");
// const mongoose = require("mongoose");
// const dotenv = require("dotenv");
// const cors = require("cors");
// const cookieParser = require("cookie-parser");

// dotenv.config();

// const app = express();

// app.use(express.json());
// app.use(cors());
// app.use(cookieParser());

// app.use("/uploads", express.static("uploads"));

// app.use("/api/auth", require("./routes/authRoutes"));
// app.use("/api/posts", require("./routes/postRoutes"));
// app.use("/api/categories", require("./routes/categoryRoutes"));

// mongoose
//   .connect(process.env.MONGO_URI)
//   .then(() => {
//     console.log("MongoDB Connected");

//     app.listen(process.env.PORT, () => {
//       console.log(`Server running on port ${process.env.PORT}`);
//     });
//   })
//   .catch((err) => console.log(err));