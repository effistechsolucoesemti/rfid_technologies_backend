import { database } from "../../services/firebase.js";
import {
  endAt,
  equalTo,
  get,
  limitToFirst,
  onValue,
  orderByChild,
  orderByKey,
  orderByValue,
  query,
  ref,
  startAt,
} from "@firebase/database";

export const filterProduct = (request, response) => {
  const { user_key, id_token, searchInput } = request.body;

  console.log({ reqBody: request.body }, { SI: request.body.searchInput[0] });

  try {
    get(
      query(
        ref(database, `users/${user_key}/table_of_products/`),
        ...[
          orderByChild(searchInput[0]),
          startAt(searchInput[1]),
          endAt(searchInput[1] + "\uf8ff"),
        ]
      )
    )
      .then((data) => {
        console.log(data.val());
        return response.send(data.val());
      })
      .catch((error) => {
        throw new Error(error);
      });
  } catch (error) {}
};
