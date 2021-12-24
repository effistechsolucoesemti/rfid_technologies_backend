import { database } from "../../services/firebase.js";
import { get, onValue, ref, remove, push } from "@firebase/database";

const DeleteProduct = (request, response) => {
  console.log("Delete Product Method");

  const internal_number = request.params.internal_number;

  try {
    const usersRef = ref(database, "users/");

    onValue(
      usersRef,
      (snapshot) => {
        snapshot.forEach((childSnapshot) => {
          const userKey = childSnapshot.key;

          get(ref(database, `users/${userKey}/table_of_products/`)).then(
            (results) => {
              results.forEach((result) => {
                const resultKey = result.key;
                const resultData = result.val();

                if (resultData.internal_number === internal_number) {
                  push(ref(database, `users/${userKey}/table_of_logs`), {
                    date: String(new Date().toISOString()),
                    operation: "deleted",
                    message: `Product ${resultData.product_name} was deleted!`,
                  });

                  remove(
                    ref(
                      database,
                      `users/${userKey}/table_of_products/${resultKey}`
                    )
                  );

                  response.status(201).end();
                }
              });
            }
          );
        });
      },
      { onlyOnce: true }
    );
  } catch (error) {
    console.error({ error: error });
  }
};

export default DeleteProduct;
