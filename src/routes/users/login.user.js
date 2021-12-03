import { Router } from "express";

import login from "../../controllers/users/login.controller.js";

const loginRoute = Router();

loginRoute.post("/login", login);

export default loginRoute;
