import { Router } from "express";
import Test from "../../controllers/products/test.js";

const testRoute = Router();

testRoute.post("/products/test", Test);

export default testRoute;
