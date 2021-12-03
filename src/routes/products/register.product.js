import { Router } from "express";
import RegisterProduct from "../../controllers/products/register.product.controller.js";

const registerProductRoute = Router();

registerProductRoute.post("/products/register", RegisterProduct);

export default registerProductRoute;
