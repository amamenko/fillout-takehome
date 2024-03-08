import express from "express";
import cors from "cors";
import { getFilteredResponses } from "./functions/getFilteredResponses";
import "dotenv/config";

const app = express();
const PORT: number = Number(process.env.PORT) || 4000;

// Enable all cross-origin requests
app.use(cors());

app.get("/:formId/filteredResponses", (req, res) => {
  getFilteredResponses(req, res);
});

app.get("/", (req, res) => {
  res.send("The Fillout takehome server is up and running!");
});

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server listening on port ${PORT}...`);
});
