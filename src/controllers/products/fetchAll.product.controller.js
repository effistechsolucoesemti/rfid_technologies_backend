import { database } from "../../services/firebase.js";
import { get, onValue, ref, off } from "@firebase/database";

const FetchAll = async (request, response, next) => {
  console.log("Fetch Product Method");
  const { id_token } = request.body;

  const usersRef = ref(database, "users/");

  try {
    return onValue(
      usersRef,
      (snapshot) => {
        snapshot.forEach((childSnapshot) => {
          const userData = childSnapshot.val();
          const userKey = childSnapshot.key;

          if (userData.id_token === id_token) {
            get(ref(database, `users/${userKey}/table_of_products`)).then(
              () => {
                response.status(201).send(userData.table_of_products);
              }
            );
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
