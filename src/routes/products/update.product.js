import { Router } from "express";
import UpdateProduct from "../../controllers/products/update.product.controller.js";

const updateProductRoute = Router();

updateProductRoute.put("/products/update/:product_key", UpdateProduct);

export default updateProductRoute;
