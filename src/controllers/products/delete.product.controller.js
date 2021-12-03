import { database } from "../../services/firebase.js";
import { get, onValue, ref, remove } from "@firebase/database";

const DeleteProduct = (request, response) => {
  console.log("Delete Product Method");
  const internal_number = request.params.internal_number;
  try {
    const usersRef = ref(database, "users/");

    console.log({ deleteStep: "step 1" });
    onValue(
      usersRef,
      (snapshot) => {
        console.log({ deleteStep: "step 2" });
        snapshot.forEach((childSnapshot) => {
          console.log({ deleteStep: "step 3" });
          const userKey = childSnapshot.key;

          get(ref(database, `users/${userKey}/table_of_products/`)).then(
            (results) => {
              console.log({ deleteStep: "step 4" });
              results.forEach((result) => {
                console.log({ deleteStep: "step 5" });
                const resultKey = result.key;

                if (result.val().internal_number === internal_number) {
                  console.log({ deleteStep: "step 6" });
                  remove(
                    ref(
                      database,
                      `users/${userKey}/table_of_products/${resultKey}`
                    )
                  );
                  console.log({ deleteStep: "step 8" });

                  response.status(201).end();
                }
                console.log({ deleteStep: "step 9" });
              });
              console.log({ deleteStep: "step 10" });
            }
          );
          console.log({ deleteStep: "step 11" });
        });
        console.log({ deleteStep: "step 12" });
      },
      { onlyOnce: true }
    );
  } catch (error) {
    console.error({ error: error });
  }
};

export default DeleteProduct;
