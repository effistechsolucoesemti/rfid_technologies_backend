import { database } from "../../services/firebase.js";
import { get, ref, runTransaction } from "firebase/database";

async function Test(request, response) {
  console.log("Triggered");

  const req = request.body;
  console.log(req);
  return;
}

export default Test;
