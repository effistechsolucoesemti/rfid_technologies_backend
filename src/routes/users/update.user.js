import { Router } from "express";

const updateRoute = Router();

updateRoute.put("/update", (request, response) => {
  response.send("Updated");
});

export default updateRoute;
