const app = require("./src/app");
const connectDB = require("./src/config/database");
const PORT = process.env.PORT || 5000;

const dotenv = require("dotenv");
dotenv.config();

// Connect to MongoDB
connectDB();

app.listen(PORT, () => {
  console.log(`Backend server is running on port ${PORT}`);
  console.log(`API URL: http://localhost:${PORT}/api`);
});
