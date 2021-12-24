import { Router } from "express";

const routes = Router();

//Welcome
import welcomeRoute from "./welcome.route.js";

//User
import loginRoute from "./users/login.user.js";
import registerUserRoute from "./users/register.user.js";
import updateRoute from "./users/update.user.js";

//Product
import registerProductRoute from "./products/register.product.route.js";
import fetchAllProductsRoute from "./products/fetchAll.product.route.js";
import deleteProductRoute from "./products/delete.product.route.js";
import updateProductRoute from "./products/update.product.route.js";
import updateProductQuantityByRFidTagRoute from "./products/updateQuantityByRFidTag.product.route.js";
import filterProducts from "./products/filter.product.route.js";

routes.use(
  welcomeRoute,
  loginRoute,
  registerUserRoute,
  updateRoute,
  registerProductRoute,
  fetchAllProductsRoute,
  deleteProductRoute,
  updateProductRoute,
  updateProductQuantityByRFidTagRoute,
  filterProducts
);

export default routes;
