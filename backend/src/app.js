const express = require("express");
const cors = require("cors");
const app = express();

app.use(cors()); // enable CORS for Postman / frontend
app.use(express.json());

const authRoutes = require("./routes/auth.routes");
app.use("/api/auth", authRoutes);
const complaintRoutes = require("./routes/complaint.routes");
app.use("/api/complaints", complaintRoutes);

const errorMiddleware = require("./middleware/error.middleware");
app.use(errorMiddleware);

module.exports = app;