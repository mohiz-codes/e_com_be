const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const path = require("path");
const connectDB = require("./config/db");

dotenv.config({ path: path.join(__dirname, ".env") });

const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

app.get("/", (req, res) => {
	res.json({ message: "E-commerce API is running" });
});

app.use("/api/products", require("./routes/productRoutes"));

if (require.main === module) {
	connectDB()
		.then(() => {
			app.listen(port, () => {
				console.log(`Server running on port ${port}`);
			});
		})
		.catch((error) => {
			console.error("Database connection failed:", error.message);
			process.exit(1);
		});
}

module.exports = app;
