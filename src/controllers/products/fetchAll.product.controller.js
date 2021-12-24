import { database } from "../../services/firebase.js";
import { get, onValue, ref } from "@firebase/database";

const FetchAll = async (request, response, next) => {
  console.log("Fetch Product Method");

  const id_token = request.params.id_token;

  console.log({ id_token });

  const usersRef = ref(database, "users/");

  try {
    onValue(usersRef, (snapshot) => {
      console.log("snapshot triggered");

      snapshot.forEach((childSnapshot) => {
        const userData = childSnapshot.val();
        const userKey = childSnapshot.key;

        if (userData.id_token === id_token) {
          get(ref(database, `users/${userKey}/table_of_products`))
            .then(() => {
              response.writeHead(201, {
                "Content-Type": "application/json",
              });
              response.write(JSON.stringify(userData.table_of_products));
              response.end();
              // response.status(201).send(userData.table_of_products);
              console.log(userData.table_of_products);
              return;
            })
            .catch((error) => {
              console.log({ error });
            });
        }

        return;
      });
    });
  } catch (error) {
    console.log("aaaaa");
  }
};

export default FetchAll;
