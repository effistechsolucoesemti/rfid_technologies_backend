import { Router } from "express";
import RegisterUser from "../../controllers/users/register.user.controller.js";

const registerUserRoute = Router();

registerUserRoute.post("/newUser", RegisterUser);

export default registerUserRoute;
