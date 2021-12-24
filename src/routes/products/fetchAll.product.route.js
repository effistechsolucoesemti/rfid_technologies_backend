import { Router } from "express";
import FetchAllProducts from "../../controllers/products/fetchAll.product.controller.js";

const fetchAllProductsRoute = Router();

fetchAllProductsRoute.get("/:id_token/products/all", FetchAllProducts);

export default fetchAllProductsRoute;
