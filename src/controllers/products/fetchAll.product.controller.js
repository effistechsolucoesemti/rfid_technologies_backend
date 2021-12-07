import { database } from "../../services/firebase.js";
import { get, onValue, ref, off } from "@firebase/database";

const FetchAll = (request, response, next) => {
  console.log("Fetch Product Method");

  const id_token = request.params.id_token;

  const usersRef = ref(database, "users/");

  try {
    return onValue(
      usersRef,
      (snapshot) => {
        snapshot.forEach((childSnapshot) => {
          const userData = childSnapshot.val();
          const userKey = childSnapshot.key;

          if (userData.id_token === id_token) {
            get(ref(database, `users/${userKey}/table_of_products`))
              .then(() => {
                return response.status(201).send(userData.table_of_products);
              })
              .catch((error) => {
                console.log({ error });
              });
          }

          return;
        });
      },
      { onlyOnce: true }
    );
  } catch (error) {
    console.log("aaaaa");
  }
};

export default FetchAll;
