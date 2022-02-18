import { Router } from "express";
import RelocateProduct from "../../controllers/products/relocate.product.controller.js";

const relocateProductRoute = Router();

relocateProductRoute.post("/products/relocate", RelocateProduct);

export default relocateProductRoute;
