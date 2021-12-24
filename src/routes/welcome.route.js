import { Router } from "express";

const welcomeRoute = Router();

welcomeRoute.get("/", (request, response) => {
  response.status(201).send("Welcome to API");
});

export default welcomeRoute;
