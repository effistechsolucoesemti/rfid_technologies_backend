import express from "express";
import cors from "cors";
import bodyParser from "body-parser";

import config from "./config.js";

import routes from "./routes/index.js";

const app = express();

//Mudar depois
app.use(cors({ origin: "*", credentials: true }));
app.use(bodyParser.json({ limit: "5mb" }));
app.use(bodyParser.urlencoded({ extended: true, limit: "5mb" }));
app.use(express.json());

app.use("/api", routes);

app.listen(config.port, () => {
  console.log(`Server started at port: ${config.port}`);
});
