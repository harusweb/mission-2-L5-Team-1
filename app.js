import express from "express";
import api2and3Router from "./src/routes/api2and3.js";

const app = express();
app.use(express.json());

app.use("/api", api2and3Router);

export default app;
