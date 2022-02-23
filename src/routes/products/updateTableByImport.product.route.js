import { Router } from "express";
import { updateTableByImport } from "../../controllers/products/update.product.controller.js";

const updateTableByImportRoute = Router();

updateTableByImportRoute.post(
  "/products/updateTableByImport",
  updateTableByImport
);

export default updateTableByImportRoute;
