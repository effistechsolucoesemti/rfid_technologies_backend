import { Router } from "express";

const routes = Router();

//Welcome
import welcomeRoute from "./welcome.js";

//User
import loginRoute from "./users/login.user.js";
import registerUserRoute from "./users/register.user.js";
import updateRoute from "./users/update.user.js";

//Product
import registerProductRoute from "./products/register.product.js";
import fetchAllProductsRoute from "./products/fetchAll.product.js";
import deleteProductRoute from "./products/delete.product.js";
import updateProductRoute from "./products/update.product.js";

routes.use(
  welcomeRoute,
  loginRoute,
  registerUserRoute,
  updateRoute,
  registerProductRoute,
  fetchAllProductsRoute,
  deleteProductRoute,
  updateProductRoute
);

export default routes;
