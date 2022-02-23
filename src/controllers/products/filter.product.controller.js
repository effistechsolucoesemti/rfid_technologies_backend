import { database } from "../../services/firebase.js";
import {
  endAt,
  get,
  orderByChild,
  query,
  ref,
  startAt,
} from "@firebase/database";

export const filterProduct = (request, response) => {
  console.log("CALLING FILTER PRODUCT METHOD");

  const { user_key, id_token, selectedOption, searchValue } = request.body;

  console.log(
    { reqBody: request.body },
    { sendedOptions: selectedOption, searchValue }
  );

  try {
    get(
      query(
        ref(database, `users/${user_key}/table_of_products/`),
        ...[
          orderByChild(selectedOption),
          startAt(searchValue),
          endAt(searchValue + "\uf8ff"),
        ]
      )
    )
      .then((data) => {
        console.log({ data: data.val() });
        return response.send(data.val());
      })
      .catch((error) => {
        throw new Error(error);
      });
  } catch (error) {}
};
