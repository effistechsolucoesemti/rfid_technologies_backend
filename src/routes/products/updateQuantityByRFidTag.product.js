import { Router } from "express";
import { updateProductQuantityByRFidTag } from "../../controllers/products/update.product.controller.js";

const updateProductQuantityByRFidTagRoute = Router();

updateProductQuantityByRFidTagRoute.put(
  "/products/updateQuantityByRFidTag/:product_key",
  updateProductQuantityByRFidTag
);

export default updateProductQuantityByRFidTagRoute;
