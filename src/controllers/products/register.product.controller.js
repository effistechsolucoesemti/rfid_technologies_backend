import { database } from "../../services/firebase.js";
import { onValue, ref, push, get } from "@firebase/database";

import { handleEmptyProductsFieldsVerification } from "../../utils/controller/emptyFieldsVerification.js";

const RegisterProduct = async (request, response) => {
  console.log("Register Product Method");
  const {
    id_token,
    rfid_tag,
    internal_number,
    product_name,
    quantity,
    ...remainder_attributes
  } = request.body;

  try {
    const emptyFields = handleEmptyProductsFieldsVerification(
      response,
      id_token,
      rfid_tag,
      internal_number,
      product_name,
      quantity
    );

    if (emptyFields) {
      return;
    }

    const usersRef = ref(database, "users/");

    onValue(
      usersRef,
      (snapshot) => {
        snapshot.forEach((childSnapshot) => {
          const userData = childSnapshot.val();
          const userKey = childSnapshot.key;

          if (userData.id_token === id_token) {
            const tableOfProducts = get(
              ref(database, `users/${userKey}/table_of_products`)
            ).then(async (products) => {
              //Check if table_of_products is created on user
              if (!products.exists()) {
                const registerProduct = await push(
                  ref(database, `users/${userKey}/table_of_products/`),
                  {
                    user_token: id_token,
                    rfid_tag,
                    internal_number,
                    product_name,
                    quantity,
                    ...remainder_attributes,
                  }
                );

                //Register a new log
                push(ref(database, `users/${userKey}/table_of_logs`), {
                  date: String(new Date().toISOString()),
                  operation: "added",
                  message: `Product ${product_name} was added!`,
                });

                if (registerProduct) {
                  console.log({
                    message: "Creating new table and registering product",
                  });
                  response.status(201).end();
                  // .send({ message: "Product registered successfully." });
                }
                return;
              }

              //If table_of_products is created, then continue

              const allProds = products.forEach((product) => {
                if (product.val().internal_number === internal_number) {
                  return true;
                } else {
                  return false;
                }
              });

              if (allProds) {
                return response.status(409).end();
                // .send({ message: "Product already registered!" });
              }

              push(ref(database, `users/${userKey}/table_of_products`), {
                user_token: id_token,
                rfid_tag,
                internal_number,
                product_name,
                quantity,
                ...remainder_attributes,
              });

              push(ref(database, `users/${userKey}/table_of_logs`), {
                date: String(new Date().toISOString()),
                operation: "added",
                message: `Product ${product_name} was added!`,
              });
              return response.status(201).end();
              // .send({ message: "Product registered successfully." });
            });

            console.log({ tableOfProducts: tableOfProducts });
            return;
          }
        });
      },
      { onlyOnce: true }
    );
  } catch (error) {
    console.log(error);
  }
};

export default RegisterProduct;
