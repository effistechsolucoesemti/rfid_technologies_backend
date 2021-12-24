import { Router } from "express";
import { filterProduct } from "../../controllers/products/filter.product.controller.js";

const filterProductsRoute = Router();

filterProductsRoute.post("/test", filterProduct);

export default filterProductsRoute;
