import { Router } from "express";
import DeleteProduct from "../../controllers/products/delete.product.controller.js";

const deleteProductRoute = Router();

deleteProductRoute.delete("/products/delete/:internal_number", DeleteProduct);

export default deleteProductRoute;
